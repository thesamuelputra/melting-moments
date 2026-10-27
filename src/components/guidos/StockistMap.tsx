'use client';

import Link from 'next/link';
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent } from 'react';
import { MAP_GEO, LAND_PATH, ROADS_PATH, PLACES } from './stockist-map-data';
import { MAP_EXTENT, directionsUrl, project, unproject, type MapPoint } from './stockist-map-geometry';
import { SITE } from '@/lib/seo';

/* ===== Data ===== */

export type Stockist = {
  id: string;
  name: string;
  kind: 'restaurant' | 'grocery';
  address: string;
  lat: number;
  lng: number;
  website?: string;
  note?: string;
};

type Filter = 'all' | Stockist['kind'];

const KITCHEN = {
  id: 'kitchen',
  name: 'Guido’s kitchen',
  address: SITE.addressShort,
  note: 'Pickup by appointment',
  lat: 48.43044,
  lng: -123.41584,
};

const KIND_LABEL: Record<Stockist['kind'], string> = { restaurant: 'Restaurant', grocery: 'Grocer' };
const KIND_PLURAL: Record<Filter, string> = { all: 'stockists', restaurant: 'restaurants', grocery: 'grocers' };
const KIND_SINGULAR: Record<Filter, string> = { all: 'stockist', restaurant: 'restaurant', grocery: 'grocer' };

// Names on the water and the land, placed only where they fit
// Names on the water and the land. Each has a few spots to try, in order,
// so a name still finds a place as the view frames a different area.
type Named = { name: string; at: [number, number][]; rotate?: number };
const WATER: Named[] = [
  { name: 'Strait of Juan de Fuca', at: [[48.384, -123.41], [48.395, -123.4], [48.398, -123.33], [48.37, -123.55]] },
  { name: 'Haro Strait', at: [[48.515, -123.255], [48.47, -123.265], [48.56, -123.27]] },
  { name: 'Saanich Inlet', at: [[48.612, -123.497]], rotate: -82 },
];
const REGIONS: Named[] = [
  { name: 'Vancouver Island', at: [[48.585, -123.66], [48.52, -123.63], [48.65, -123.76], [48.5, -123.74]] },
  { name: 'Salt Spring Island', at: [[48.81, -123.5], [48.78, -123.47]] },
];

const MIN_SPAN = 900; // map units (9 km): one pin still shows its neighbourhood
const KITCHEN_ONLY_SPAN = 1500; // with no stockists yet, show the kitchen among the towns around it
const TWEEN_MS = 520;
const COMPACT_BELOW = 520; // plate width in px under which pins draw a size smaller
// Matches the CSS breakpoint where the list drops below the map: from here
// down, a caption under the map names the chosen place instead of a tag
const STACKED_QUERY = '(max-width: 860px)';

function subscribeStacked(onChange: () => void) {
  const mq = window.matchMedia(STACKED_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
const isStacked = () => window.matchMedia(STACKED_QUERY).matches;

/* ===== Pure helpers ===== */

type View = { x: number; y: number; w: number; h: number; scale: number; boxW: number; boxH: number };
type Box = { w: number; h: number };
type Pad = { top: number; right: number; bottom: number; left: number };

/** A view that fits the points inside the padding, never zooms in past
 *  minSpan, and stays inside the drawn area where it can. */
function fitView(points: MapPoint[], box: Box, pad: Pad, minSpan: number): View {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const bw = Math.max(maxX - minX, 1);
  const bh = Math.max(maxY - minY, 1);
  const availW = Math.max(box.w - pad.left - pad.right, 40);
  const availH = Math.max(box.h - pad.top - pad.bottom, 40);
  const scale = Math.min(availW / bw, availH / bh, Math.min(box.w, box.h) / minSpan);
  const w = box.w / scale;
  const h = box.h / scale;
  const cx = pad.left + availW / 2;
  const cy = pad.top + availH / 2;
  let x = (minX + maxX) / 2 - cx / scale;
  let y = (minY + maxY) / 2 - cy / scale;
  x = w >= MAP_EXTENT.w ? (MAP_EXTENT.w - w) / 2 : Math.min(Math.max(x, 0), MAP_EXTENT.w - w);
  y = h >= MAP_EXTENT.h ? (MAP_EXTENT.h - h) / 2 : Math.min(Math.max(y, 0), MAP_EXTENT.h - h);
  return { x, y, w, h, scale, boxW: box.w, boxH: box.h };
}

function padFor(box: Box): Pad {
  const edge = Math.round(Math.min(box.w, box.h) * 0.1);
  return { top: Math.max(56, edge), right: Math.max(44, edge), bottom: Math.max(72, edge + 24), left: Math.max(44, edge) };
}

/** Between two views of the same box: the centre moves in a straight line
 *  and the zoom eases in log space, so the move reads as one camera glide. */
function between(a: View, b: View, k: number): View {
  const acx = a.x + a.w / 2, acy = a.y + a.h / 2;
  const bcx = b.x + b.w / 2, bcy = b.y + b.h / 2;
  const scale = Math.exp(Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * k);
  const w = b.boxW / scale, h = b.boxH / scale;
  const cx = acx + (bcx - acx) * k, cy = acy + (bcy - acy) * k;
  return { x: cx - w / 2, y: cy - h / 2, w, h, scale, boxW: b.boxW, boxH: b.boxH };
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type PinNode = { id: string; r: number; ax: number; ay: number; x: number; y: number; fixed?: boolean };

/** Fans out pins that would overlap, each tethered to its true spot, so a
 *  tight cluster spreads with hairline leaders instead of stacking. */
function relaxPins(nodes: PinNode[], box: Box, edge: number): PinNode[] {
  for (const n of nodes) { n.x = n.ax; n.y = n.ay; }
  for (let it = 0; it < 320; it++) {
    const spring = it < 240 ? 0.06 : 0;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += (a.ax - a.x) * spring;
      a.y += (a.ay - a.y) * spring;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        const min = a.r + b.r + 4;
        if (d < min) {
          if (d < 0.01) { const ang = (i * 7 + j * 3) * 0.9; dx = Math.cos(ang); dy = Math.sin(ang); d = 1; }
          const push = (min - d) / 2, ux = dx / d, uy = dy / d;
          const wa = a.fixed ? 0 : b.fixed ? 2 : 1;
          const wb = b.fixed ? 0 : a.fixed ? 2 : 1;
          a.x -= ux * push * wa; a.y -= uy * push * wa;
          b.x += ux * push * wb; b.y += uy * push * wb;
        }
      }
    }
    for (const n of nodes) {
      n.x = Math.min(Math.max(n.x, n.r + edge), box.w - n.r - edge);
      n.y = Math.min(Math.max(n.y, n.r + edge), box.h - n.r - edge);
    }
  }
  return nodes;
}

function niceScaleKm(pxPerKm: number, targetPx: number): number {
  let best = 0.5;
  for (const s of [0.5, 1, 2, 5, 10, 20, 50]) if (s * pxPerKm <= targetPx) best = s;
  return best;
}

function graticuleStep(spanDeg: number): number {
  for (const m of [1, 2, 5, 10, 15, 30, 60]) if ((spanDeg * 60) / m <= 4.2) return m / 60;
  return 1;
}

function formatDegrees(v: number, pos: string, neg: string): string {
  const a = Math.abs(v);
  let d = Math.floor(a + 1e-9);
  let m = Math.round((a - d) * 60);
  if (m === 60) { d += 1; m = 0; }
  return `${d}°${m < 10 ? '0' : ''}${m}′${v >= 0 ? pos : neg}`;
}

/** A canvas that answers "is this point on land?" for label placement.
 *  Built once, on first use in the browser; the plate only draws there. */
let landCanvas: { ctx: CanvasRenderingContext2D; path: Path2D } | null | undefined;
function landTester() {
  if (landCanvas === undefined) {
    const ctx = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
    landCanvas = ctx ? { ctx, path: new Path2D(LAND_PATH) } : null;
  }
  return landCanvas;
}

/* ===== The crest, small, for the kitchen pin and its list row ===== */

function KitchenCrest({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(124,89,29,0.7)" strokeWidth="2.4" />
      <circle cx="50" cy="50" r="41.5" fill="none" stroke="rgba(124,89,29,0.7)" strokeWidth="1.2" />
      <path d="M15.2 37.4 A 37 37 0 0 1 43.6 13.6" fill="none" stroke="#1C6B4A" strokeWidth="6" strokeLinecap="round" />
      <path d="M56.4 13.6 A 37 37 0 0 1 84.8 37.4" fill="none" stroke="#C13A2E" strokeWidth="6" strokeLinecap="round" />
      <text x="50" y="68" textAnchor="middle" fill="#211C13" style={{ font: '400 50px var(--font-serif)' }}>G</text>
    </svg>
  );
}

/** The pin symbol for a kind: a disc for restaurants, a diamond for grocers,
 *  so the two read apart by shape as well as colour. */
function KindMark({ kind, label }: { kind: Stockist['kind']; label?: string | number }) {
  return (
    <span className={`g-mark g-mark--${kind}`} aria-hidden="true">
      {label !== undefined && <span className="g-mark__num">{label}</span>}
    </span>
  );
}

/* ===== Component ===== */

type Numbered = Stockist & { p: MapPoint; num: number };

export default function StockistMap({ stockists }: { stockists: Stockist[] }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const landId = `g-land-${uid}`;
  const plateRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const [box, setBox] = useState<Box | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [hovered, setHovered] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const active = hovered ?? chosen;
  const stacked = useSyncExternalStore(subscribeStacked, isStacked, () => false);

  // Hover follows a real mouse only. A tap also sends mouse events, and on a
  // phone those would pin the highlight on until another pin was tapped.
  const hoverOn = (id: string) => (e: PointerEvent) => { if (e.pointerType === 'mouse') setHovered(id); };
  const hoverOff = (e: PointerEvent) => { if (e.pointerType === 'mouse') setHovered(null); };

  const kitchenPoint = useMemo(() => project(KITCHEN), []);

  // Numbered in the order the owner set in the admin
  const numbered: Numbered[] = useMemo(() => stockists.map((s, i) => ({ ...s, p: project(s), num: i + 1 })), [stockists]);

  const counts = useMemo(() => ({
    all: numbered.length,
    restaurant: numbered.filter((s) => s.kind === 'restaurant').length,
    grocery: numbered.filter((s) => s.kind === 'grocery').length,
  }), [numbered]);
  const showFilter = counts.restaurant > 0 && counts.grocery > 0;
  const visible = useMemo(() => (filter === 'all' ? numbered : numbered.filter((s) => s.kind === filter)), [numbered, filter]);

  // Measure the plate; everything drawn in pixels follows its size
  useEffect(() => {
    const el = plateRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setBox({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const target = useMemo(
    () => (box ? fitView([kitchenPoint, ...visible.map((s) => s.p)], box, padFor(box), visible.length ? MIN_SPAN : KITCHEN_ONLY_SPAN) : null),
    [box, visible, kitchenPoint]
  );

  // The view glides to each new fit; a resize or reduced motion jumps
  const [view, setView] = useState<View | null>(null);
  const shown = useRef<View | null>(null);
  useEffect(() => { shown.current = view; }, [view]);
  useEffect(() => {
    if (!target) return;
    const from = shown.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    if (!from || reduce || from.boxW !== target.boxW || from.boxH !== target.boxH) {
      raf = requestAnimationFrame(() => setView(target));
      return () => cancelAnimationFrame(raf);
    }
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / TWEEN_MS);
      setView(k < 1 ? between(from, target, easeInOut(k)) : target);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const drawing = useMemo(() => {
    if (!view || !box) return null;
    const W = box.w, H = box.h;
    const toPx = (p: MapPoint) => ({ x: (p.x - view.x) * view.scale, y: (p.y - view.y) * view.scale });
    const compact = W < COMPACT_BELOW;

    // Graticule and the degree ticks in the plate margin
    const tl = unproject({ x: view.x, y: view.y });
    const br = unproject({ x: view.x + view.w, y: view.y + view.h });
    const step = graticuleStep(Math.min(tl.lat - br.lat, br.lng - tl.lng));
    let grat = '';
    const ticks: { key: string; side: 'left' | 'top'; pos: number; text: string }[] = [];
    for (let lat = Math.ceil(br.lat / step) * step; lat < tl.lat; lat += step) {
      const y = project({ lat, lng: MAP_GEO.west }).y;
      grat += `M${view.x} ${y}H${view.x + view.w}`;
      const py = (y - view.y) * view.scale;
      if (py > 30 && py < H - 30) ticks.push({ key: `la${lat.toFixed(4)}`, side: 'left', pos: py, text: formatDegrees(lat, 'N', 'S') });
    }
    for (let lng = Math.ceil(tl.lng / step) * step; lng < br.lng; lng += step) {
      const x = project({ lat: MAP_GEO.south, lng }).x;
      grat += `M${x} ${view.y}V${view.y + view.h}`;
      const px = (x - view.x) * view.scale;
      if (px > 30 && px < W - 30) ticks.push({ key: `lo${lng.toFixed(4)}`, side: 'top', pos: px, text: formatDegrees(lng, 'E', 'W') });
    }

    // The piano-key border: alternating ink and paper per minute of arc,
    // anchored to absolute minutes so the frame never shimmers as it refits
    const band = 4;
    const keys: { x: number; y: number; w: number; h: number }[] = [];
    const xOf = (lng: number) => (project({ lat: MAP_GEO.south, lng }).x - view.x) * view.scale;
    const yOf = (lat: number) => (project({ lat, lng: MAP_GEO.west }).y - view.y) * view.scale;
    const pick = (pxPerMin: number) => { for (const o of [1, 2, 5, 10, 15, 30]) if (o * pxPerMin >= 9) return o; return 60; };
    const ksX = pick(Math.abs(xOf(tl.lng + 1 / 60) - xOf(tl.lng)));
    const ksY = pick(Math.abs(yOf(br.lat + 1 / 60) - yOf(br.lat)));
    for (let m = Math.floor((tl.lng * 60) / ksX) * ksX; m < br.lng * 60; m += ksX) {
      if (((Math.round(m / ksX) % 2) + 2) % 2) continue;
      const x0 = Math.max(band, xOf(m / 60)), x1 = Math.min(W - band, xOf((m + ksX) / 60));
      if (x1 > x0) { keys.push({ x: x0, y: 0, w: x1 - x0, h: band }); keys.push({ x: x0, y: H - band, w: x1 - x0, h: band }); }
    }
    for (let n = Math.floor((br.lat * 60) / ksY) * ksY; n < tl.lat * 60; n += ksY) {
      if (((Math.round(n / ksY) % 2) + 2) % 2) continue;
      const y0 = Math.max(band, yOf((n + ksY) / 60)), y1 = Math.min(H - band, yOf(n / 60));
      if (y1 > y0) { keys.push({ x: 0, y: y0, w: band, h: y1 - y0 }); keys.push({ x: W - band, y: y0, w: band, h: y1 - y0 }); }
    }

    // Names are placed once the view settles; mid-glide they would hop
    // between spots, and the land test is the costly part of a frame
    const settled = view === target;

    // Pins, fanned out where they would overlap. Mid-glide, a pin whose spot
    // is still outside the frame waits there instead of crowding the edge.
    const kr = compact ? 16 : 18;
    const sr = compact ? 10 : 11;
    const onFrame = (q: { x: number; y: number }, r: number) => settled || (q.x > -r && q.x < W + r && q.y > -r && q.y < H + r);
    const nodes: PinNode[] = [];
    const kq = toPx(kitchenPoint);
    if (onFrame(kq, kr)) nodes.push({ id: KITCHEN.id, r: kr, fixed: true, ax: kq.x, ay: kq.y, x: kq.x, y: kq.y });
    for (const s of visible) {
      const q = toPx(s.p);
      if (onFrame(q, sr)) nodes.push({ id: s.id, r: sr, ax: q.x, ay: q.y, x: q.x, y: q.y });
    }
    relaxPins(nodes, { w: W, h: H }, 8);

    // Labels: water names in italic, a few island and town names, never on a
    // pin, and towns only where they sit on land (water names only on water)
    const tester = landTester();
    tester?.ctx.setTransform(view.scale, 0, 0, view.scale, -view.x * view.scale, -view.y * view.scale);
    const onLand = (px: number, py: number) => (tester ? tester.ctx.isPointInPath(tester.path, px, py, 'evenodd') : true);
    type Rect = { x: number; y: number; w: number; h: number };
    // Points spread over a label's box, about every 10px, for the land test
    const spread = (r: Rect): [number, number][] => {
      const nx = Math.max(2, Math.ceil(r.w / 10)), ny = Math.max(2, Math.ceil(r.h / 10));
      const pts: [number, number][] = [];
      for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) pts.push([r.x + (r.w * i) / nx, r.y + (r.h * j) / ny]);
      return pts;
    };
    const allLand = (r: Rect) => spread(r).every(([x, y]) => onLand(x, y));
    const allWater = (r: Rect) => !spread(r).some(([x, y]) => onLand(x, y));
    const taken: Rect[] = nodes.map((n) => ({ x: n.x - n.r - 6, y: n.y - n.r - 6, w: 2 * n.r + 12, h: 2 * n.r + 12 }));
    const hit = (r: Rect) => taken.some((t) => r.x < t.x + t.w && r.x + r.w > t.x && r.y < t.y + t.h && r.y + r.h > t.y);
    const inside = (r: Rect, bottomRoom: number) => r.x >= 14 && r.y >= 30 && r.x + r.w <= W - 14 && r.y + r.h <= H - bottomRoom;
    const labels: { key: string; kind: 'water' | 'region' | 'town' | 'kitchen'; x: number; y: number; text: string; rotate?: number }[] = [];

    if (settled) {
    for (const wtr of WATER) {
      const tw = wtr.name.length * 7.4, th = 18;
      for (const [lat, lng] of wtr.at) {
        const q = toPx(project({ lat, lng }));
        const rect = wtr.rotate ? { x: q.x - th / 2, y: q.y - tw / 2, w: th, h: tw } : { x: q.x - tw / 2, y: q.y - th / 2, w: tw, h: th };
        if (!inside(rect, 64) || hit(rect) || !allWater(rect)) continue;
        taken.push(rect);
        labels.push({ key: `w-${wtr.name}`, kind: 'water', x: q.x, y: q.y, text: wtr.name, rotate: wtr.rotate });
        break;
      }
    }
    for (const rg of REGIONS) {
      const tw = rg.name.length * 15.5 + 16, th = 20;
      for (const [lat, lng] of rg.at) {
        const q = toPx(project({ lat, lng }));
        const rect = { x: q.x - tw / 2, y: q.y - th / 2, w: tw, h: th };
        if (!inside(rect, 70) || hit(rect) || !allLand(rect)) continue;
        taken.push(rect);
        labels.push({ key: `r-${rg.name}`, kind: 'region', x: q.x, y: q.y, text: rg.name });
        break;
      }
    }
    // The kitchen gets its name beside the crest when there is room
    {
      const k = nodes.find((n) => n.id === KITCHEN.id);
      if (k) {
      const text = 'Guido’s kitchen';
      const tw = text.length * 8.8 + 8, th = 14;
      const spots = [[0, k.r + 14], [0, -(k.r + 14)], [k.r + tw / 2 + 8, 0], [-(k.r + tw / 2 + 8), 0]].map(([dx, dy]) => ({
        x: k.x + dx,
        y: k.y + dy,
        rect: { x: k.x + dx - tw / 2, y: k.y + dy - th / 2, w: tw, h: th },
      }));
      const open = spots.filter((p) => inside(p.rect, 64) && !hit(p.rect));
      // Clear of the shoreline if it can be, otherwise the first free side
      const spot = open.find((p) => allLand(p.rect)) ?? open[0];
      if (spot) {
        taken.push(spot.rect);
        labels.push({ key: 'kitchen', kind: 'kitchen', x: spot.x, y: spot.y, text });
      }
      }
    }
    const maxTowns = Math.max(3, Math.round((W * H) / 70000));
    let towns = 0;
    for (const t of [...PLACES].sort((a, b) => b.population - a.population)) {
      if (towns >= maxTowns) break;
      const node = toPx(project(t));
      const tw = t.name.length * 8.6 + 8, th = 14;
      // Centred on the town first, then just above, below, or to one side
      for (const [dx, dy] of [[0, 0], [0, -16], [0, 16], [tw / 2 + 4, 0], [-tw / 2 - 4, 0]]) {
        const q = { x: node.x + dx, y: node.y + dy };
        const rect = { x: q.x - tw / 2, y: q.y - th / 2, w: tw, h: th };
        if (!inside(rect, 70) || hit(rect)) continue;
        if (!allLand(rect)) continue;
        taken.push({ x: rect.x - 16, y: rect.y - 12, w: rect.w + 32, h: rect.h + 24 });
        labels.push({ key: `t-${t.name}`, kind: 'town', x: q.x, y: q.y, text: t.name });
        towns++;
        break;
      }
    }
    }

    // Scale bar: a round number of km, about a fifth of the plate wide
    const pxPerKm = view.scale * (1000 / MAP_GEO.metresPerUnit);
    const km = niceScaleKm(pxPerKm, W * 0.22);

    return { W, H, compact, grat, ticks, keys, band, nodes, labels, km, scaleBarPx: km * pxPerKm };
  }, [view, target, box, visible, kitchenPoint]);

  // The card for the active pin: the side that covers the fewest pins
  const activeTag = useMemo(() => {
    if (!drawing || !active || stacked) return null;
    const node = drawing.nodes.find((n) => n.id === active);
    if (!node) return null;
    const s = active === KITCHEN.id ? null : numbered.find((x) => x.id === active);
    const title = s ? s.name : KITCHEN.name;
    const meta = s ? `${KIND_LABEL[s.kind]} · ${s.address}` : `${KITCHEN.note} · ${KITCHEN.address}`;
    const w = Math.min(Math.max(title.length * 8.8, meta.length * 6.5) + 28, drawing.W - 24);
    const h = 58;
    const gap = node.r + 10;
    const candidates = [
      { x: node.x - w / 2, y: node.y - gap - h },
      { x: node.x - w / 2, y: node.y + gap },
      { x: node.x + gap, y: node.y - h / 2 },
      { x: node.x - gap - w, y: node.y - h / 2 },
    ].map((c) => ({ x: Math.min(Math.max(c.x, 12), drawing.W - 12 - w), y: Math.min(Math.max(c.y, 12), drawing.H - 12 - h) }));
    const covers = (c: { x: number; y: number }) =>
      drawing.nodes.filter((n) => n.id !== node.id && n.x + n.r > c.x && n.x - n.r < c.x + w && n.y + n.r > c.y && n.y - n.r < c.y + h).length +
      (node.x + node.r > c.x && node.x - node.r < c.x + w && node.y + node.r > c.y && node.y - node.r < c.y + h ? 10 : 0);
    const best = candidates.reduce((a, c) => (covers(c) < covers(a) ? c : a), candidates[0]);
    return { x: best.x, y: best.y, title, meta };
  }, [drawing, active, numbered, stacked]);

  const selectFromPin = (id: string) => {
    setChosen((cur) => (cur === id ? null : id));
    // Stacked, the caption under the map names the place and the list sits
    // further down, so the page stays put; beside the map, bring the row in
    if (stacked) return;
    const row = listRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  };

  // Water lines sit closer to the shore when zoomed out, so a coast full of
  // small islands stays an engraving rather than a thicket
  const ringK = view ? Math.min(1, Math.max(0.55, 0.55 + (0.45 * (view.scale - 0.12)) / 0.5)) : 1;

  const activeStockist = active && active !== KITCHEN.id ? numbered.find((s) => s.id === active) : null;
  const statusText = `Showing ${visible.length} ${visible.length === 1 ? KIND_SINGULAR[filter] : KIND_PLURAL[filter]} and the kitchen.`;

  return (
    <div className="g-stockists__body">
      <figure className="g-plate-figure">
        <div className="g-plate-wrap" aria-hidden="true">
          {drawing && (
            <div className="g-plate-ticks">
              {drawing.ticks.map((t) => (
                <span
                  key={t.key}
                  className={`g-plate-tick g-plate-tick--${t.side}`}
                  style={t.side === 'left' ? { top: `calc(var(--g-plate-margin) + ${t.pos.toFixed(1)}px)` } : { left: `calc(var(--g-plate-margin) + ${t.pos.toFixed(1)}px)` }}
                >
                  {t.text}
                </span>
              ))}
            </div>
          )}
          <div className={`g-plate${drawing?.compact ? ' is-compact' : ''}${active ? ' has-active' : ''}`} ref={plateRef}>
            <svg className="g-plate__geo" viewBox={view ? `${view.x} ${view.y} ${view.w} ${view.h}` : `${MAP_EXTENT.w * 0.72} ${MAP_EXTENT.h * 0.74} 1500 1800`} preserveAspectRatio="xMidYMid slice">
              <defs>
                <path id={landId} d={LAND_PATH} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
              </defs>
              <rect x={-20000} y={-20000} width={60000} height={60000} className="g-plate__sea" />
              {/* Engraved water lines: the coast stroked wide and cut back with
                  the sea colour, ring by ring, so contours step out from shore */}
              <g className="g-plate__rings">
                {[[18, 0.16], [11, 0.3], [5, 0.5]].map(([d, o]) => (
                  <g key={d}>
                    <use href={`#${landId}`} className="g-plate__ring" style={{ strokeWidth: 2 * d * ringK + 0.9, strokeOpacity: o }} />
                    <use href={`#${landId}`} className="g-plate__ring-cut" style={{ strokeWidth: 2 * d * ringK - 0.9 }} />
                  </g>
                ))}
              </g>
              {drawing && <path className="g-plate__grat" d={drawing.grat} />}
              <use href={`#${landId}`} className="g-plate__land" />
              <path className="g-plate__roads" d={ROADS_PATH} />
            </svg>

            {drawing && (
              <>
                <svg className="g-plate__over" viewBox={`0 0 ${drawing.W} ${drawing.H}`}>
                  {drawing.nodes.map((n) =>
                    Math.hypot(n.x - n.ax, n.y - n.ay) > n.r * 0.55 ? (
                      <g key={`l-${n.id}`}>
                        <line className="g-plate__leader" x1={n.ax} y1={n.ay} x2={n.x - Math.cos(Math.atan2(n.y - n.ay, n.x - n.ax)) * n.r} y2={n.y - Math.sin(Math.atan2(n.y - n.ay, n.x - n.ax)) * n.r} />
                        <circle className="g-plate__anchor" cx={n.ax} cy={n.ay} r={2} />
                      </g>
                    ) : null
                  )}
                  <g className="g-plate__frame">
                    <rect className="g-key-paper" x={0} y={0} width={drawing.W} height={drawing.band} />
                    <rect className="g-key-paper" x={0} y={drawing.H - drawing.band} width={drawing.W} height={drawing.band} />
                    <rect className="g-key-paper" x={0} y={0} width={drawing.band} height={drawing.H} />
                    <rect className="g-key-paper" x={drawing.W - drawing.band} y={0} width={drawing.band} height={drawing.H} />
                    {drawing.keys.map((k, i) => <rect key={i} className="g-key-ink" x={k.x} y={k.y} width={k.w} height={k.h} />)}
                    {[[0, 0], [drawing.W - drawing.band, 0], [0, drawing.H - drawing.band], [drawing.W - drawing.band, drawing.H - drawing.band]].map(([x, y]) => (
                      <rect key={`c${x}-${y}`} className="g-key-ink" x={x} y={y} width={drawing.band} height={drawing.band} />
                    ))}
                    <rect className="g-key-line" x={0.4} y={0.4} width={drawing.W - 0.8} height={drawing.H - 0.8} />
                    <rect className="g-key-line" x={drawing.band} y={drawing.band} width={drawing.W - 2 * drawing.band} height={drawing.H - 2 * drawing.band} />
                  </g>
                </svg>

                <div className="g-plate__labels">
                  {drawing.labels.map((l) => (
                    <span
                      key={l.key}
                      className={`g-plate__label g-plate__label--${l.kind}`}
                      style={{ left: l.x, top: l.y, transform: l.rotate ? `translate(-50%, -50%) rotate(${l.rotate}deg)` : undefined }}
                    >
                      {l.text}
                    </span>
                  ))}
                </div>

                <div className="g-plate__pins">
                  {drawing.nodes.map((n) => {
                    const s = n.id === KITCHEN.id ? null : visible.find((x) => x.id === n.id);
                    return (
                      <span
                        key={n.id}
                        className={`g-pin${s ? ` g-pin--${s.kind}` : ' g-pin--kitchen'}${active === n.id ? ' is-active' : ''}`}
                        style={{ left: n.x, top: n.y }}
                        onPointerEnter={hoverOn(n.id)}
                        onPointerLeave={hoverOff}
                        onClick={() => selectFromPin(n.id)}
                      >
                        {s ? <KindMark kind={s.kind} label={s.num} /> : <span className="g-pin__crest"><KitchenCrest size={drawing.compact ? 32 : 36} /></span>}
                      </span>
                    );
                  })}
                </div>

                {activeTag && (
                  <span className="g-plate__tag" style={{ left: activeTag.x, top: activeTag.y }}>
                    <b>{activeTag.title}</b>
                    <small>{activeTag.meta}</small>
                  </span>
                )}

                <div className="g-plate__north">
                  <svg width="10" height="26" viewBox="0 0 10 26"><path d="M5 0 L9 12 L5 10 L1 12 Z" fill="currentColor" /><path d="M5 10 L5 26" stroke="currentColor" strokeWidth="0.8" /></svg>
                  N
                </div>
                <div className="g-plate__scale">
                  <div className="g-plate__scale-bar" style={{ width: drawing.scaleBarPx }}><i /><i /><i /><i /></div>
                  <div className="g-plate__scale-nums"><span>0</span><span>{drawing.km} km</span></div>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="g-plate__caption" aria-hidden="true">
          {activeStockist ? (
            <><b>{activeStockist.num}. {activeStockist.name}</b> {KIND_LABEL[activeStockist.kind]} · {activeStockist.address}</>
          ) : active === KITCHEN.id ? (
            <><b>{KITCHEN.name}</b> {KITCHEN.note} · {KITCHEN.address}</>
          ) : (
            'Choose a pin to see the place.'
          )}
        </p>

        <figcaption className="g-plate-cap">
          <span className="g-legend">
            <span><KindMark kind="restaurant" />Restaurant</span>
            <span><KindMark kind="grocery" />Grocer</span>
            <span><KitchenCrest size={16} />Guido&rsquo;s kitchen</span>
          </span>
          <span className="g-credit">
            Map data{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
              &copy; OpenStreetMap contributors<span className="sr-only"> (opens in a new tab)</span>
            </a>
            , ODbL
          </span>
        </figcaption>
      </figure>

      <div className="g-stock-list-wrap">
        {showFilter && (
          <div className="g-filter" role="group" aria-label="Show stockists">
            {(['all', 'restaurant', 'grocery'] as Filter[]).map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => { setFilter(f); setChosen(null); }}>
                {f !== 'all' && <KindMark kind={f} />}
                {f === 'all' ? 'All' : f === 'restaurant' ? 'Restaurants' : 'Grocers'}
                <span className="g-filter__count">{counts[f]}</span>
              </button>
            ))}
          </div>
        )}
        <p className="sr-only" role="status">{showFilter ? statusText : ''}</p>

        <ol
          className="g-stock-list"
          ref={listRef}
          onPointerLeave={hoverOff}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(null); }}
        >
          <li
            className={`g-stock g-stock--kitchen${active === KITCHEN.id ? ' is-active' : ''}`}
            data-id={KITCHEN.id}
            onPointerEnter={hoverOn(KITCHEN.id)}
            onFocus={() => setHovered(KITCHEN.id)}
          >
            <span className="g-stock__mark"><KitchenCrest size={34} /></span>
            <div>
              <h3 className="g-stock__name">{KITCHEN.name}</h3>
              <p className="g-stock__addr">{KITCHEN.address}</p>
              <p className="g-stock__note">{KITCHEN.note}</p>
            </div>
            <div className="g-stock__side">
              <span className="g-stock__kind g-stock__kind--kitchen">Kitchen</span>
              <a className="g-textlink" href={directionsUrl('Guido’s Gourmet', `${SITE.street}, ${SITE.locality}, ${SITE.region}`)} target="_blank" rel="noopener noreferrer">
                Directions<span className="sr-only"> to Guido&rsquo;s kitchen (opens in a new tab)</span>
              </a>
            </div>
          </li>
          {numbered.map((s) => (
            <li
              key={s.id}
              className={`g-stock g-stock--${s.kind}${active === s.id ? ' is-active' : ''}`}
              data-id={s.id}
              hidden={filter !== 'all' && s.kind !== filter}
              onPointerEnter={hoverOn(s.id)}
              onFocus={() => setHovered(s.id)}
            >
              <span className="g-stock__mark"><KindMark kind={s.kind} label={s.num} /></span>
              <div>
                <h3 className="g-stock__name">{s.name}</h3>
                <p className="g-stock__addr">{s.address}</p>
                {s.note && <p className="g-stock__note">{s.note}</p>}
              </div>
              <div className="g-stock__side">
                <span className="g-stock__kind">{KIND_LABEL[s.kind]}</span>
                <a className="g-textlink" href={directionsUrl(s.name, s.address)} target="_blank" rel="noopener noreferrer">
                  Directions<span className="sr-only"> to {s.name} (opens in a new tab)</span>
                </a>
                {s.website && (
                  <a className="g-textlink" href={s.website} target="_blank" rel="noopener noreferrer">
                    Website<span className="sr-only"> of {s.name} (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p className="g-stock-ask">
          Would you like Guido&rsquo;s in your shop or on your menu?{' '}
          <Link className="g-textlink g-textlink--quiet" href="/contact">Get in touch</Link>
        </p>
      </div>
    </div>
  );
}
