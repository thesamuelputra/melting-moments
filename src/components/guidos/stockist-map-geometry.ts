import { MAP_GEO } from './stockist-map-data';

/**
 * Geometry shared by the public stockist map, the admin pin picker and the
 * server-side coverage check. Positions are in map units (ten metres each,
 * y pointing down), the same space the generated land and road paths use.
 */

export type LatLng = { lat: number; lng: number };
export type MapPoint = { x: number; y: number };
export type ViewBox = { x: number; y: number; w: number; h: number };

export const MAP_EXTENT: ViewBox = { x: 0, y: 0, w: MAP_GEO.width, h: MAP_GEO.height };

/** Map units for a latitude and longitude. */
export function project({ lat, lng }: LatLng): MapPoint {
  return {
    x: ((lng - MAP_GEO.west) * MAP_GEO.metresPerDegLon) / MAP_GEO.metresPerUnit,
    y: MAP_GEO.height - ((lat - MAP_GEO.south) * MAP_GEO.metresPerDegLat) / MAP_GEO.metresPerUnit,
  };
}

/** Latitude and longitude for a point in map units. */
export function unproject({ x, y }: MapPoint): LatLng {
  return {
    lat: MAP_GEO.south + ((MAP_GEO.height - y) * MAP_GEO.metresPerUnit) / MAP_GEO.metresPerDegLat,
    lng: MAP_GEO.west + (x * MAP_GEO.metresPerUnit) / MAP_GEO.metresPerDegLon,
  };
}

/** Whether a place falls inside the area the map draws. */
export function isInsideCoverage({ lat, lng }: LatLng): boolean {
  return lat >= MAP_GEO.south && lat <= MAP_GEO.north && lng >= MAP_GEO.west && lng <= MAP_GEO.east;
}

/** Where an empty map, or a new pin with no address yet, starts out */
export const GREATER_VICTORIA: MapPoint = project({ lat: 48.45, lng: -123.4 });

/** Roughly the Capital Region's urban core, Langford to Oak Bay. The public
 *  map frames these places first, and the heading over it says "around
 *  Victoria" only when every place falls inside. */
export function inGreaterVictoria({ lat, lng }: LatLng): boolean {
  return lat >= 48.38 && lat <= 48.6 && lng >= -123.62 && lng <= -123.25;
}

export const COVERAGE_DESCRIPTION ='south Vancouver Island, from Sooke and Victoria up to Nanaimo and the southern Gulf Islands';

/**
 * A view box that frames every point with some room around it, at a given
 * width to height ratio. A minimum span keeps a single shop, or a tight
 * cluster, from zooming in past the point where the coastline reads well,
 * and the box never strays outside the drawn area.
 */
export function fitViewBox(
  points: MapPoint[],
  { aspect, padding = 0.18, minSpan = 1600 }: { aspect: number; padding?: number; minSpan?: number }
): ViewBox {
  if (points.length === 0) return clampToExtent(centredBox(GREATER_VICTORIA, minSpan * 1.6, aspect));

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  let w = Math.max(maxX - minX, minSpan);
  let h = Math.max(maxY - minY, minSpan / aspect);
  w *= 1 + padding * 2;
  h *= 1 + padding * 2;
  if (w / h > aspect) h = w / aspect;
  else w = h * aspect;

  return clampToExtent(centredBox({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 }, w, aspect, h));
}

function centredBox(centre: MapPoint, w: number, aspect: number, h = w / aspect): ViewBox {
  return { x: centre.x - w / 2, y: centre.y - h / 2, w, h };
}

function clampToExtent(box: ViewBox): ViewBox {
  const scale = Math.max(box.w / MAP_EXTENT.w, box.h / MAP_EXTENT.h, 1);
  const w = box.w / scale;
  const h = box.h / scale;
  const x = Math.min(Math.max(box.x + (box.w - w) / 2, 0), MAP_EXTENT.w - w);
  const y = Math.min(Math.max(box.y + (box.h - h) / 2, 0), MAP_EXTENT.h - h);
  return { x, y, w, h };
}

export function viewBoxAttr(box: ViewBox): string {
  return `${box.x.toFixed(1)} ${box.y.toFixed(1)} ${box.w.toFixed(1)} ${box.h.toFixed(1)}`;
}

/** A Google Maps directions link to the place, no API key needed. */
export function directionsUrl(name: string, address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${name}, ${address}`)}`;
}
