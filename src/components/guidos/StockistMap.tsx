'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { LAND_PATH, ROADS_PATH, PLACES } from './stockist-map-data';
import { MAP_EXTENT, directionsUrl, inGreaterVictoria, project, type MapPoint } from './stockist-map-geometry';
import { SITE } from '@/lib/seo';
import './stockist-map.css';

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

type Kind = Stockist['kind'];
type Filter = 'all' | Kind;
type Place = Stockist & { num: number; p: MapPoint };

const KITCHEN = {
  id: 'kitchen',
  name: 'Guido’s kitchen',
  address: SITE.addressShort,
  note: 'Pickup by appointment',
  lat: 48.43044,
  lng: -123.41584,
};
const KITCHEN_POINT = project(KITCHEN);

const KIND_LABEL: Record<Kind, string> = { grocery: 'Grocer', restaurant: 'Restaurant' };

const HIT = 44; // every marker is at least this big to tap
const MIN_SPAN = 900; // map units (9 km): one place still shows its neighbourhood
const KITCHEN_ONLY_SPAN = 1500;
const CLUSTER_SPAN = 160;
const TWEEN_MS = 450;
const FILTER_FROM = 7; // show the grocer and restaurant filter from this many places

/* ===== Geometry ===== */

type Box = { w: number; h: number };
type View = { x: number; y: number; w: number; h: number; scale: number; boxW: number; boxH: number };

function fitView(points: MapPoint[], box: Box, minSpan: number): View {
  const pad = { top: 64, right: 40, bottom: 40, left: 40 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const availW = Math.max(box.w - pad.left - pad.right, 60);
  const availH = Math.max(box.h - pad.top - pad.bottom, 60);
  const scale = Math.min(availW / Math.max(maxX - minX, 1), availH / Math.max(maxY - minY, 1), Math.min(box.w, box.h) / minSpan);
  const w = box.w / scale, h = box.h / scale;
  let x = (minX + maxX) / 2 - (pad.left + availW / 2) / scale;
  let y = (minY + maxY) / 2 - (pad.top + availH / 2) / scale;
  // Stop a few screen pixels short of the edge of the map data, so the cut
  // coastline and the stroke that hides it stay outside the frame
  const inset = 3 / scale;
  x = w >= MAP_EXTENT.w - 2 * inset ? (MAP_EXTENT.w - w) / 2 : Math.min(Math.max(x, inset), MAP_EXTENT.w - w - inset);
  y = h >= MAP_EXTENT.h - 2 * inset ? (MAP_EXTENT.h - h) / 2 : Math.min(Math.max(y, inset), MAP_EXTENT.h - h - inset);
  return { x, y, w, h, scale, boxW: box.w, boxH: box.h };
}

/** The camera glides: the centre moves in a line and the zoom eases in log space */
function between(a: View, b: View, k: number): View {
  const scale = Math.exp(Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * k);
  const cx = a.x + a.w / 2 + (b.x + b.w / 2 - (a.x + a.w / 2)) * k;
  const cy = a.y + a.h / 2 + (b.y + b.h / 2 - (a.y + a.h / 2)) * k;
  const w = b.boxW / scale, h = b.boxH / scale;
  return { x: cx - w / 2, y: cy - h / 2, w, h, scale, boxW: b.boxW, boxH: b.boxH };
}
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ===== Markers on the map: places, the kitchen, and groups of places ===== */

type Item = {
  key: string;
  type: 'place' | 'kitchen' | 'cluster';
  ids: string[];
  x: number;
  y: number;
  ax: number; // where it really is; differs when nudged clear of the kitchen
  ay: number;
  w: number;
  first: number; // lowest number inside, for keyboard order
};

const clusterWidth = (n: number) => Math.max(HIT, 24 + `${n} places`.length * 7.4);
type Spot = { x: number; y: number; w: number };
const overlaps = (a: Spot, b: Spot) => Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 2 && Math.abs(a.y - b.y) < HIT + 2;

// "Show all places" sits in the map's top right corner (12px in, one tap target
// tall, about 166px wide); while it shows, markers and town names keep clear of it
const CORNER_W = 178;
const cornerSpot = (box: Box): Spot => ({ x: box.w - 12 - CORNER_W / 2, y: 12 + HIT / 2, w: CORNER_W });

/** Places whose tap areas would overlap become one "n places" marker. The
 *  kitchen and the chosen place never join a group; anything on top of them
 *  is nudged aside with a hairline back to where it really is. The kitchen is
 *  left off when a zoom puts it out of frame, rather than parked at the edge. */
function layoutItems(places: Place[], view: View, box: Box, chosenId?: string | null, keepCornerClear = false): Item[] {
  const toPx = (p: MapPoint) => ({ x: (p.x - view.x) * view.scale, y: (p.y - view.y) * view.scale });
  const inFrame = (q: { x: number; y: number }) => q.x >= 0 && q.x <= box.w && q.y >= 0 && q.y <= box.h;
  const k = toPx(KITCHEN_POINT);
  const kitchen: Item | null = inFrame(k)
    ? { key: KITCHEN.id, type: 'kitchen', ids: [KITCHEN.id], x: k.x, y: k.y, ax: k.x, ay: k.y, w: HIT, first: 0 }
    : null;

  let items: Item[] = places
    .map((pl) => ({ pl, q: toPx(pl.p) }))
    .filter(({ q }) => inFrame(q))
    .map(({ pl, q }) => ({ key: pl.id, type: 'place' as const, ids: [pl.id], x: q.x, y: q.y, ax: q.x, ay: q.y, w: HIT, first: pl.num }));

  const nums = new Map(places.map((pl) => [pl.id, pl.num]));
  const merge = (group: Item[]): Item => {
    const ids = group.flatMap((g) => g.ids).sort((a, b) => (nums.get(a) ?? 0) - (nums.get(b) ?? 0));
    const ax = group.reduce((s, g) => s + g.ax * g.ids.length, 0) / ids.length;
    const ay = group.reduce((s, g) => s + g.ay * g.ids.length, 0) / ids.length;
    return { key: `c:${ids.join(',')}`, type: 'cluster', ids, x: ax, y: ay, ax, ay, w: clusterWidth(ids.length), first: Math.min(...group.map((g) => g.first)) };
  };

  const fits = (it: Item, x: number, y: number) => x - it.w / 2 >= 4 && x + it.w / 2 <= box.w - 4 && y - HIT / 2 >= 4 && y + HIT / 2 <= box.h - 4;
  // Keep a marker wholly inside the frame; says whether it had to move
  const clampIn = (it: Item) => {
    const x = Math.min(Math.max(it.x, it.w / 2 + 4), box.w - it.w / 2 - 4);
    const y = Math.min(Math.max(it.y, HIT / 2 + 4), box.h - HIT / 2 - 4);
    const moved = x !== it.x || y !== it.y;
    it.x = x;
    it.y = y;
    return moved;
  };
  // Away from what it sits on, along the line between them. If that would leave
  // the frame it goes the other way instead, so the edge cannot push it back.
  const nudgeOff = (it: Item, from: Spot) => {
    let dx = it.x - from.x, dy = it.y - from.y;
    if (Math.hypot(dx, dy) < 1) { dx = 1; dy = 0; }
    const needX = (it.w + from.w) / 2 + 4, needY = HIT + 4;
    const t = Math.min(needX / Math.max(Math.abs(dx), 0.001), needY / Math.max(Math.abs(dy), 0.001));
    const ways = [[dx, dy], [-dx, dy], [dx, -dy], [-dx, -dy]];
    const [wx, wy] = ways.find(([sx, sy]) => fits(it, from.x + sx * t, from.y + sy * t)) ?? ways[0];
    it.x = from.x + wx * t;
    it.y = from.y + wy * t;
  };

  // The chosen place stands on its own, so it can always be seen
  const at = chosenId ? items.findIndex((it) => it.ids[0] === chosenId) : -1;
  const chosen = at >= 0 ? items.splice(at, 1)[0] : null;
  const corner = keepCornerClear ? cornerSpot(box) : null;
  for (const f of [kitchen, corner]) if (chosen && f && overlaps(chosen, f)) nudgeOff(chosen, f);
  const fixed = [kitchen, chosen, corner].filter((it): it is Spot => !!it);

  for (let pass = 0; pass < 8; pass++) {
    let changed = false;
    // Group anything that overlaps
    const used = new Set<number>();
    const next: Item[] = [];
    for (let i = 0; i < items.length; i++) {
      if (used.has(i)) continue;
      const group = [items[i]];
      used.add(i);
      for (let grew = true; grew; ) {
        grew = false;
        for (let j = 0; j < items.length; j++) {
          if (used.has(j)) continue;
          if (group.some((g) => overlaps(g, items[j]))) { group.push(items[j]); used.add(j); grew = true; }
        }
      }
      if (group.length > 1) changed = true;
      next.push(group.length > 1 ? merge(group) : group[0]);
    }
    items = next;
    // Nudge anything sitting on the kitchen, the chosen place or the corner out
    // from under it, then back inside the frame; a move means another round
    for (const it of items) {
      for (const f of fixed) {
        if (!overlaps(it, f)) continue;
        nudgeOff(it, f);
        changed = true;
      }
      if (clampIn(it)) changed = true;
    }
    if (!changed) break;
  }
  if (chosen) items.push(chosen);
  const all = [...(kitchen ? [kitchen] : []), ...items.sort((a, b) => a.first - b.first)];
  for (const it of all) clampIn(it);
  return all;
}

/** A canvas that answers "is this point on land?" for the town names. Built
 *  once, on first use in the browser. */
let landCanvas: { ctx: CanvasRenderingContext2D; path: Path2D } | null | undefined;
function landTester() {
  if (landCanvas === undefined) {
    const ctx = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
    landCanvas = ctx ? { ctx, path: new Path2D(LAND_PATH) } : null;
  }
  return landCanvas;
}

function townLabels(view: View, box: Box, items: Item[], keepCornerClear = false) {
  const tester = landTester();
  if (!tester) return [];
  tester.ctx.setTransform(view.scale, 0, 0, view.scale, -view.x * view.scale, -view.y * view.scale);
  type Rect = { x: number; y: number; w: number; h: number };
  const taken: Rect[] = [...items, ...(keepCornerClear ? [cornerSpot(box)] : [])].map((it) => ({ x: it.x - it.w / 2 - 4, y: it.y - HIT / 2 - 4, w: it.w + 8, h: HIT + 8 }));
  const hit = (r: Rect) => taken.some((t) => r.x < t.x + t.w && r.x + r.w > t.x && r.y < t.y + t.h && r.y + r.h > t.y);
  const onLand = (r: Rect) => {
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 2; j++) {
      if (!tester.ctx.isPointInPath(tester.path, r.x + (r.w * i) / 4, r.y + (r.h * j) / 2, 'evenodd')) return false;
    }
    return true;
  };
  const max = Math.max(2, Math.round((box.w * box.h) / 60000));
  const out: { name: string; x: number; y: number }[] = [];
  for (const t of [...PLACES].sort((a, b) => b.population - a.population)) {
    if (out.length >= max) break;
    const p = project(t);
    const x = (p.x - view.x) * view.scale, y = (p.y - view.y) * view.scale;
    const w = t.name.length * 7 + 10, h = 16;
    // Centred on the town first; then just above or below it, then beside it (a harbour can sit on the spot)
    for (const [dx, dy] of [[0, 0], [0, -18], [0, 18], [w / 2 + 6, 0], [-(w / 2 + 6), 0]]) {
      const r = { x: x + dx - w / 2, y: y + dy - h / 2, w, h };
      if (r.x < 8 || r.y < 8 || r.x + r.w > box.w - 8 || r.y + r.h > box.h - 8) continue;
      if (hit(r) || !onLand(r)) continue;
      taken.push({ x: r.x - 12, y: r.y - 8, w: r.w + 24, h: r.h + 16 });
      out.push({ name: t.name, x: x + dx, y: y + dy });
      break;
    }
  }
  return out;
}

/* ===== The marker, the same in the list, on the map and in the key ===== */

function Mark({ kind, label, keyMark }: { kind: Kind | 'kitchen'; label?: string | number; keyMark?: boolean }) {
  return (
    <span className={`g-mark g-mark--${kind}${keyMark ? ' g-mark--key' : ''}`} aria-hidden="true">
      {label}
    </span>
  );
}

/* ===== Component ===== */

type Frame = { type: 'home' } | { type: 'all' } | { type: 'ids'; ids: string[]; minSpan: number };

export default function StockistMap({ stockists }: { stockists: Stockist[] }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Numbered the way the list shows them: grocers, then restaurants, each in the owner's order
  const places: Place[] = useMemo(
    () =>
      [...stockists.filter((s) => s.kind === 'grocery'), ...stockists.filter((s) => s.kind !== 'grocery')]
        .map((s, i) => ({ ...s, num: i + 1, p: project(s) })),
    [stockists]
  );
  const byId = useMemo(() => new Map(places.map((p) => [p.id, p])), [places]);

  const counts = { grocery: places.filter((p) => p.kind === 'grocery').length, restaurant: places.filter((p) => p.kind === 'restaurant').length };
  const showChips = places.length >= FILTER_FROM && counts.grocery > 0 && counts.restaurant > 0;

  const [filter, setFilter] = useState<Filter>('all');
  const shown = useMemo(() => (filter === 'all' ? places : places.filter((p) => p.kind === filter)), [places, filter]);

  const [selected, setSelected] = useState<string | null>(null);
  const [clusterList, setClusterList] = useState<string[] | null>(null);
  const [frame, setFrame] = useState<Frame>({ type: 'home' });
  const [box, setBox] = useState<Box | null>(null);
  const [announce, setAnnounce] = useState('');
  const [focusKey, setFocusKey] = useState<string>(KITCHEN.id);
  const pendingFocus = useRef<string[] | null>(null);

  // Measure the map; everything drawn in pixels follows its size
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setBox({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const target = useMemo(() => {
    if (!box) return null;
    if (frame.type === 'ids') {
      const pts = frame.ids.map((id) => (id === KITCHEN.id ? KITCHEN_POINT : byId.get(id)?.p)).filter((p): p is MapPoint => !!p);
      return fitView(pts.length ? pts : [KITCHEN_POINT], box, frame.minSpan);
    }
    if (shown.length === 0) return fitView([KITCHEN_POINT], box, KITCHEN_ONLY_SPAN);
    const near = shown.filter(inGreaterVictoria);
    const set = frame.type === 'all' || near.length === 0 ? shown : near;
    return fitView([KITCHEN_POINT, ...set.map((p) => p.p)], box, MIN_SPAN);
  }, [box, frame, shown, byId]);

  // The view glides to each new frame; a resize or reduced motion jumps
  const [view, setView] = useState<View | null>(null);
  const lastView = useRef<View | null>(null);
  useEffect(() => { lastView.current = view; }, [view]);
  useEffect(() => {
    if (!target) return;
    const from = lastView.current;
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

  const settled = !!view && view === target;
  const targetItems = useMemo(() => (target && box ? layoutItems(shown, target, box) : []), [target, box, shown]);
  const outOfFrame = target ? shown.length - targetItems.reduce((n, it) => n + (it.type === 'kitchen' ? 0 : it.ids.length), 0) : 0;
  const showAllButton = outOfFrame > 0;
  const items = useMemo(() => (view && box ? layoutItems(shown, view, box, selected, showAllButton) : []), [view, box, shown, selected, showAllButton]);
  const towns = useMemo(() => (settled && view && box ? townLabels(view, box, items, showAllButton) : []), [settled, view, box, items, showAllButton]);

  // Keep one marker in the tab order; follow it when the markers change
  const rovingKey = items.some((it) => it.key === focusKey) ? focusKey : items[0]?.key;

  // After a zoom, put focus on the first place that was asked for
  useEffect(() => {
    if (!settled || !pendingFocus.current) return;
    const want = pendingFocus.current;
    pendingFocus.current = null;
    const it = items.find((i) => i.ids.some((id) => want.includes(id)));
    if (!it) return;
    const raf = requestAnimationFrame(() => {
      setFocusKey(it.key);
      pinsRef.current?.querySelector<HTMLButtonElement>(`[data-key="${CSS.escape(it.key)}"]`)?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [settled, items]);

  // A group listed under the map can open below the fold, so bring it into view
  useEffect(() => {
    if (!clusterList) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panelRef.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }, [clusterList]);

  const stacked = () => window.matchMedia('(max-width: 959px)').matches;
  const smooth = (): ScrollBehavior => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

  const nameOf = (id: string) => (id === KITCHEN.id ? KITCHEN.name : byId.get(id)?.name ?? '');

  /** Choose a place. From the list it is shown on the map, zooming in if it
   *  is out of frame or inside a group; from the map its row is brought in. */
  const choose = (id: string, from: 'list' | 'map', pointer: boolean) => {
    const next = selected === id ? null : id;
    // On the map the button just pressed can go: a group's list closes, or a
    // place let go rejoins its group. Focus then follows the place to its marker.
    if (from === 'map' && (clusterList || !next)) pendingFocus.current = [id];
    setSelected(next);
    setClusterList(null);
    setAnnounce(next ? `${nameOf(next)} chosen.` : 'Nothing chosen.');
    if (!next) return;
    if (next !== KITCHEN.id && target && box) {
      const holder = targetItems.find((it) => it.ids.includes(next));
      if (!holder) setFrame({ type: 'ids', ids: [KITCHEN.id, next], minSpan: MIN_SPAN });
      else if (holder.type === 'cluster') setFrame({ type: 'ids', ids: holder.ids, minSpan: CLUSTER_SPAN });
    } else if (next === KITCHEN.id && !targetItems.some((it) => it.type === 'kitchen')) {
      // Zoomed in elsewhere: go back to the view that holds the kitchen
      setFrame({ type: 'home' });
    }
    if (from === 'list' && pointer && stacked()) {
      figureRef.current?.scrollIntoView({ block: 'start', behavior: smooth() });
    }
    if (from === 'map' && !stacked()) {
      listRef.current?.querySelector<HTMLElement>(`[data-place="${CSS.escape(next)}"]`)?.scrollIntoView({ block: 'nearest', behavior: smooth() });
    }
  };

  const openCluster = (it: Item) => {
    if (!target || !box) return;
    const pts = it.ids.map((id) => byId.get(id)?.p).filter((p): p is MapPoint => !!p);
    const zoomed = fitView(pts, box, CLUSTER_SPAN);
    if (zoomed.scale > target.scale * 1.15) {
      pendingFocus.current = it.ids;
      setClusterList(null);
      setFrame({ type: 'ids', ids: it.ids, minSpan: CLUSTER_SPAN });
      setAnnounce(`Zoomed in to ${it.ids.length} places.`);
    } else {
      // Too close together to pull apart: list them under the map instead
      setClusterList(it.ids);
      setSelected(null);
      setAnnounce(`${it.ids.length} places here, listed under the map.`);
    }
  };

  const onPinsKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = items.map((it) => it.key);
    const at = keys.indexOf(rovingKey ?? '');
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (at + 1) % keys.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (at - 1 + keys.length) % keys.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = keys.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setFocusKey(keys[next]);
    pinsRef.current?.querySelector<HTMLButtonElement>(`[data-key="${CSS.escape(keys[next])}"]`)?.focus();
  };

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setClusterList(null);
    // A chosen place the filter still shows stays chosen, and stays in frame even out of town
    const kept = selected && selected !== KITCHEN.id && (f === 'all' || byId.get(selected)?.kind === f) ? byId.get(selected) : undefined;
    if (selected && selected !== KITCHEN.id && !kept) setSelected(null);
    setFrame(kept && !inGreaterVictoria(kept) ? { type: 'ids', ids: [KITCHEN.id, kept.id], minSpan: MIN_SPAN } : { type: 'home' });
    const n = f === 'all' ? places.length : counts[f];
    const noun = f === 'all' ? (n === 1 ? 'place' : 'places') : f === 'grocery' ? (n === 1 ? 'grocer' : 'grocers') : n === 1 ? 'restaurant' : 'restaurants';
    setAnnounce(`Showing ${n} ${noun} and the kitchen.`);
  };

  const showAll = () => {
    // The button goes once everything is in frame, so focus moves onto the map
    pendingFocus.current = [KITCHEN.id];
    setFrame({ type: 'all' });
    setClusterList(null);
    setAnnounce('Showing every place on the map.');
  };

  const isPointer = (e: MouseEvent) => e.detail > 0;
  const chosen = selected === KITCHEN.id ? null : selected ? byId.get(selected) ?? null : null;
  const groups: { kind: Kind; title: string; list: Place[] }[] = [
    { kind: 'grocery', title: 'Grocers', list: shown.filter((p) => p.kind === 'grocery') },
    { kind: 'restaurant', title: 'Restaurants', list: shown.filter((p) => p.kind === 'restaurant') },
  ];

  const placeLinks = (p: { name: string; address: string; website?: string }) => (
    <>
      <a href={directionsUrl(p.name, p.address)} target="_blank" rel="noopener noreferrer">
        Directions<span className="g-sr-only"> to {p.name} (opens in a new tab)</span>
      </a>
      {p.website && (
        <a href={p.website} target="_blank" rel="noopener noreferrer">
          Website<span className="g-sr-only"> of {p.name} (opens in a new tab)</span>
        </a>
      )}
    </>
  );
  const kitchenLinks = (
    <>
      <a href={directionsUrl('Guido’s Gourmet', SITE.addressFull)} target="_blank" rel="noopener noreferrer">
        Directions<span className="g-sr-only"> to Guido&rsquo;s kitchen (opens in a new tab)</span>
      </a>
      <Link href="/guidos/order">Order ahead</Link>
    </>
  );

  return (
    <div className="g-where-body">
      {/* The list: the main way in, complete without the map */}
      <div ref={listRef}>
        {showChips && (
          <div className="g-where-tabs" role="group" aria-label="Places to show">
            {(['all', 'grocery', 'restaurant'] as Filter[]).map((f) => (
              <button key={f} type="button" className="category-tab" aria-pressed={filter === f} onClick={() => changeFilter(f)}>
                {f === 'all' ? 'All' : f === 'grocery' ? 'Grocers' : 'Restaurants'}
              </button>
            ))}
          </div>
        )}

        <div className="g-places-group">
          <h3 className="menu-index g-places-title">Pickup</h3>
          <ul className="g-places-list">
            <li className={`g-place${selected === KITCHEN.id ? ' is-selected' : ''}`} data-place={KITCHEN.id}>
              <button type="button" className="g-place-pick" aria-pressed={selected === KITCHEN.id} onClick={(e) => choose(KITCHEN.id, 'list', isPointer(e))}>
                <Mark kind="kitchen" label="G" />
                <span>
                  <span className="g-place-name">{KITCHEN.name}</span>
                  <span className="g-place-meta">{KITCHEN.address}</span>
                  <span className="g-sr-only">, show on the map</span>
                </span>
              </button>
              <p className="g-place-note">{KITCHEN.note}</p>
              <p className="g-place-links">{kitchenLinks}</p>
            </li>
          </ul>
        </div>

        {groups.map((g) =>
          g.list.length === 0 ? null : (
            <div className="g-places-group" key={g.kind}>
              <h3 className="menu-index g-places-title">{g.title}</h3>
              <ul className="g-places-list">
                {g.list.map((p) => (
                  <li key={p.id} className={`g-place${selected === p.id ? ' is-selected' : ''}`} data-place={p.id}>
                    <button type="button" className="g-place-pick" aria-pressed={selected === p.id} onClick={(e) => choose(p.id, 'list', isPointer(e))}>
                      <Mark kind={p.kind} label={p.num} />
                      <span>
                        <span className="g-place-name">{p.name}</span>
                        <span className="g-place-meta">{KIND_LABEL[p.kind]} &middot; {p.address}</span>
                        <span className="g-sr-only">, show on the map</span>
                      </span>
                    </button>
                    {p.note && <p className="g-place-note">{p.note}</p>}
                    <p className="g-place-links">{placeLinks(p)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>

      {/* The map: a picture of the same list */}
      <div className="g-map" ref={figureRef}>
        <div
          className="g-map-canvas"
          ref={canvasRef}
          role="group"
          aria-label="Map of these places. Use the arrow keys to move between markers and Enter to choose one."
        >
          <svg
            className="g-map-svg"
            aria-hidden="true"
            focusable="false"
            viewBox={view ? `${view.x} ${view.y} ${view.w} ${view.h}` : `${KITCHEN_POINT.x - 800} ${KITCHEN_POINT.y - 700} 1600 1400`}
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Water only where the map data reaches; a very wide view shows a plain margin beyond it */}
            <rect className="g-map-water" x={0} y={0} width={MAP_EXTENT.w} height={MAP_EXTENT.h} />
            <path className="g-map-land" d={LAND_PATH} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
            <path className="g-map-roads" d={ROADS_PATH} />
            <rect className="g-map-edge" x={0} y={0} width={MAP_EXTENT.w} height={MAP_EXTENT.h} vectorEffect="non-scaling-stroke" />
          </svg>

          {box && (
            <svg className="g-map-leaders" aria-hidden="true" focusable="false" viewBox={`0 0 ${box.w} ${box.h}`}>
              {items.map((it) =>
                Math.hypot(it.x - it.ax, it.y - it.ay) > 6 ? (
                  <g key={`l-${it.key}`}>
                    <line x1={it.ax} y1={it.ay} x2={it.x} y2={it.y} />
                    <circle cx={it.ax} cy={it.ay} r={2.5} />
                  </g>
                ) : null
              )}
            </svg>
          )}

          <div className="g-map-towns" aria-hidden="true">
            {towns.map((t) => (
              <span key={t.name} className="g-map-town" style={{ left: t.x, top: t.y }}>{t.name}</span>
            ))}
          </div>

          <div className="g-map-pins" ref={pinsRef} onKeyDown={onPinsKey}>
            {items.map((it) => {
              const tab = it.key === rovingKey ? 0 : -1;
              const style = { left: it.x, top: it.y };
              if (it.type === 'cluster') {
                const isSel = !!selected && it.ids.includes(selected);
                return (
                  <button
                    key={it.key}
                    type="button"
                    data-key={it.key}
                    className={`g-map-pin g-map-cluster${isSel ? ' is-selected' : ''}`}
                    style={style}
                    tabIndex={tab}
                    aria-label={`${it.ids.length} places: ${it.ids.map((id) => nameOf(id)).join(', ')}. Show them`}
                    onFocus={() => setFocusKey(it.key)}
                    onClick={() => openCluster(it)}
                  >
                    <Mark kind="grocery" label={`${it.ids.length} places`} />
                  </button>
                );
              }
              const id = it.ids[0];
              const p = it.type === 'kitchen' ? null : byId.get(id);
              return (
                <button
                  key={it.key}
                  type="button"
                  data-key={it.key}
                  className={`g-map-pin${selected === id ? ' is-selected' : ''}`}
                  style={style}
                  tabIndex={tab}
                  aria-pressed={selected === id}
                  aria-label={p ? `${p.num}, ${p.name}, ${KIND_LABEL[p.kind].toLowerCase()}` : `${KITCHEN.name}, pickup`}
                  onFocus={() => setFocusKey(it.key)}
                  onClick={(e) => choose(id, 'map', isPointer(e))}
                >
                  {p ? <Mark kind={p.kind} label={p.num} /> : <Mark kind="kitchen" label="G" />}
                </button>
              );
            })}
          </div>

          {showAllButton && (
            <button type="button" className="g-map-all" onClick={showAll}>
              Show all places
            </button>
          )}
        </div>

        {/* What is chosen, in words, once something is. On a wide screen only a
            group too close to pull apart shows here (see the stylesheet). */}
        {(clusterList || selected === KITCHEN.id || chosen) && (
          <div ref={panelRef} className={`g-map-panel${clusterList ? ' g-map-panel--group' : ''}`}>
            {clusterList ? (
              <>
                <p className="g-map-panel-meta">{clusterList.length} places here</p>
                <ul className="g-place-links" style={{ flexDirection: 'column', gap: 0 }}>
                  {clusterList.map((id) => (
                    <li key={id}>
                      <button type="button" className="g-textlink" onClick={(e) => choose(id, 'map', isPointer(e))}>
                        {byId.get(id)?.num}. {nameOf(id)}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : selected === KITCHEN.id ? (
              <>
                <p className="g-map-panel-name">{KITCHEN.name}</p>
                <p className="g-map-panel-meta">{KITCHEN.note} &middot; {KITCHEN.address}</p>
                <p className="g-place-links">{kitchenLinks}</p>
              </>
            ) : chosen ? (
              <>
                <p className="g-map-panel-name">{chosen.num}. {chosen.name}</p>
                <p className="g-map-panel-meta">{KIND_LABEL[chosen.kind]} &middot; {chosen.address}</p>
                {chosen.note && <p className="g-map-panel-note">{chosen.note}</p>}
                <p className="g-place-links">{placeLinks(chosen)}</p>
              </>
            ) : null}
          </div>
        )}
        <p className="g-sr-only" aria-live="polite">{announce}</p>

        <div className="g-map-foot">
          {places.length > 0 && (
            <ul className="g-legend" aria-label="Key">
              <li><Mark kind="kitchen" label="G" keyMark />Guido&rsquo;s kitchen</li>
              {(['grocery', 'restaurant'] as Kind[]).filter((k) => counts[k] > 0).map((k) => (
                <li key={k}><Mark kind={k} keyMark />{KIND_LABEL[k]}</li>
              ))}
            </ul>
          )}
          <p className="g-credit">
            Map data{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
              &copy; OpenStreetMap contributors<span className="g-sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </div>

      <p className="g-places-ask">
        Would you like Guido&rsquo;s in your shop or on your menu? <Link href="/contact">Get in touch</Link>
      </p>
    </div>
  );
}
