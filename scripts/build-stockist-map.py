"""
Builds the land, road and place-name data for the Guido's stockist map
(src/components/guidos/stockist-map-data.ts) from OpenStreetMap.

The map is drawn by us rather than embedded from a map provider, so it can
wear the Guido's palette and needs no API key. This script turns raw OSM
coastline into land shapes for south Vancouver Island and writes them as
compact SVG paths in a local projection the map component shares.

Run it only when the covered area changes (for example to reach further
up-Island). It needs Python 3 with shapely, and network access to the
Overpass API:

    python3 -m venv /tmp/geo && /tmp/geo/bin/pip install shapely
    /tmp/geo/bin/python scripts/build-stockist-map.py

Map data (c) OpenStreetMap contributors, available under the ODbL. The
public map credits it in its caption.
"""

import json
import math
import os
import sys
import urllib.parse
import urllib.request

import shapely
from shapely.geometry import LineString, MultiPolygon, Polygon, box
from shapely.ops import polygonize, unary_union
from shapely.strtree import STRtree

# Coverage: Sooke and Victoria up to Nanaimo, the Saanich Peninsula and the
# southern Gulf Islands. Stockists must fall inside it.
SOUTH, WEST, NORTH, EAST = 48.28, -124.30, 49.25, -123.20

OVERPASS = "https://overpass-api.de/api/interpreter"
USER_AGENT = "MeltingMomentsMapBuild/1.0 (info@meltingmoments.ca)"
CACHE = os.environ.get("MAP_CACHE_DIR")  # optional folder of saved Overpass replies

# One map unit is ten metres; coordinates are written as whole units.
METRES_PER_UNIT = 10
LAT0 = (SOUTH + NORTH) / 2
M_PER_DEG_LAT = 110_540
M_PER_DEG_LON = 111_320 * math.cos(math.radians(LAT0))

LAND_SIMPLIFY_M = 20      # coastline detail kept, in metres
ROAD_SIMPLIFY_M = 40
MIN_ISLAND_M2 = 20_000    # islets smaller than this vanish at map scale
MIN_ROAD_M = 400

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "components", "guidos", "stockist-map-data.ts")


def overpass(name, query):
    if CACHE and os.path.exists(os.path.join(CACHE, f"{name}.json")):
        with open(os.path.join(CACHE, f"{name}.json")) as f:
            return json.load(f)
    body = urllib.parse.urlencode({"data": query}).encode()
    req = urllib.request.Request(OVERPASS, data=body, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=300) as res:
        return json.load(res)


def to_metres(lon, lat):
    """Local equirectangular projection with y pointing north, so the OSM
    rule of land on the left of a coastline keeps its usual meaning."""
    return ((lon - WEST) * M_PER_DEG_LON, (lat - SOUTH) * M_PER_DEG_LAT)


def way_line(way):
    return LineString([to_metres(p["lon"], p["lat"]) for p in way["geometry"]])


def side_of(line, point):
    """Positive when the point lies to the left of the line near its closest
    approach. The straight path from a point to its nearest coastline crosses
    no other coastline, so that side says land or water."""
    d = line.project(point)
    a = line.interpolate(max(d - 1.0, 0.0))
    b = line.interpolate(min(d + 1.0, line.length))
    near = line.interpolate(d)
    return (b.x - a.x) * (point.y - near.y) - (b.y - a.y) * (point.x - near.x)


def build_land(coast):
    lines = [way_line(w) for w in coast["elements"] if len(w.get("geometry", [])) > 1]
    merged = shapely.line_merge(shapely.MultiLineString(lines), directed=True)
    coast_lines = list(merged.geoms) if hasattr(merged, "geoms") else [merged]

    frame = box(0, 0, (EAST - WEST) * M_PER_DEG_LON, (NORTH - SOUTH) * M_PER_DEG_LAT)
    noded = unary_union([frame.boundary, *coast_lines])
    faces = [f.intersection(frame) for f in polygonize(noded)]
    faces = [f for f in faces if not f.is_empty and f.area > 1]

    tree = STRtree(coast_lines)
    land = []
    for face in faces:
        point = face.representative_point()
        nearest = coast_lines[tree.nearest(point)]
        if side_of(nearest, point) > 0:
            land.append(face)

    merged_land = unary_union(land)
    polys = merged_land.geoms if isinstance(merged_land, MultiPolygon) else [merged_land]
    kept = [p for p in polys if p.area >= MIN_ISLAND_M2]
    return MultiPolygon(kept).simplify(LAND_SIMPLIFY_M, preserve_topology=True), frame


def build_roads(roads, frame):
    lines = [way_line(w) for w in roads["elements"] if len(w.get("geometry", [])) > 1]
    merged = shapely.line_merge(unary_union(lines))
    parts = list(merged.geoms) if hasattr(merged, "geoms") else [merged]
    clipped = []
    for part in parts:
        piece = part.intersection(frame).simplify(ROAD_SIMPLIFY_M)
        for line in getattr(piece, "geoms", [piece]):
            if line.geom_type == "LineString" and line.length >= MIN_ROAD_M:
                clipped.append(line)
    return clipped


def to_units(x, y, height_units):
    """Metres (y north) to map units (y down, as SVG draws)."""
    return round(x / METRES_PER_UNIT), round(height_units - y / METRES_PER_UNIT)


def path_for(coords, height_units, close):
    pts = [to_units(x, y, height_units) for x, y in coords]
    deduped = [pts[0]] + [p for i, p in enumerate(pts[1:], 1) if p != pts[i - 1]]
    if close and len(deduped) > 1 and deduped[-1] == deduped[0]:
        deduped = deduped[:-1]
    if len(deduped) < (3 if close else 2):
        return ""
    out = [f"M{deduped[0][0]} {deduped[0][1]}"]
    px, py = deduped[0]
    rel = []
    for x, y in deduped[1:]:
        rel.append(f"{x - px} {y - py}")
        px, py = x, y
    out.append("l" + " ".join(rel))
    if close:
        out.append("z")
    return "".join(out)


def main():
    coast = overpass("coast", f'[out:json][timeout:250];way["natural"="coastline"]({SOUTH},{WEST},{NORTH},{EAST});out geom;')
    roads = overpass("roads", f'[out:json][timeout:250];way["highway"~"^(motorway|trunk)$"]({SOUTH},{WEST},{NORTH},{EAST});out geom;')
    places = overpass("places", f'[out:json][timeout:60];node["place"~"^(city|town)$"]({SOUTH},{WEST},{NORTH},{EAST});out;')

    land, frame = build_land(coast)
    road_lines = build_roads(roads, frame)

    width_units = round(frame.bounds[2] / METRES_PER_UNIT)
    height_units = round(frame.bounds[3] / METRES_PER_UNIT)

    land_path = "".join(
        path_for(ring.coords, height_units, True)
        for poly in land.geoms
        for ring in [poly.exterior, *poly.interiors]
    )
    roads_path = "".join(path_for(line.coords, height_units, False) for line in road_lines)

    place_list = sorted(
        (
            {
                "name": e["tags"]["name"],
                "lat": round(e["lat"], 4),
                "lng": round(e["lon"], 4),
                "population": int(str(e["tags"].get("population", "0")).replace(",", "") or 0),
            }
            for e in places["elements"]
            if e["tags"].get("name")
        ),
        key=lambda p: -p["population"],
    )

    header = (
        "// Generated by scripts/build-stockist-map.py from OpenStreetMap data.\n"
        "// Map data (c) OpenStreetMap contributors, ODbL. Do not edit by hand;\n"
        "// rerun the script to change the covered area.\n\n"
    )
    geo = {
        "south": SOUTH, "west": WEST, "north": NORTH, "east": EAST,
        "lat0": LAT0, "metresPerUnit": METRES_PER_UNIT,
        "metresPerDegLat": M_PER_DEG_LAT, "metresPerDegLon": round(M_PER_DEG_LON, 3),
        "width": width_units, "height": height_units,
    }
    body = (
        header
        + f"export const MAP_GEO = {json.dumps(geo)} as const;\n\n"
        + f"export const PLACES: {{ name: string; lat: number; lng: number; population: number }}[] = {json.dumps(place_list)};\n\n"
        + f"export const LAND_PATH = {json.dumps(land_path)};\n\n"
        + f"export const ROADS_PATH = {json.dumps(roads_path)};\n"
    )
    with open(OUT, "w") as f:
        f.write(body)
    print(f"land rings {sum(1 + len(p.interiors) for p in land.geoms)}, land path {len(land_path)} chars, roads {len(road_lines)} lines {len(roads_path)} chars, places {len(place_list)}")
    print(f"wrote {os.path.relpath(OUT)} ({len(body) / 1024:.0f} KB)")


if __name__ == "__main__":
    sys.exit(main())
