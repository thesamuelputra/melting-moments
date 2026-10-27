'use client';

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { LAND_PATH, ROADS_PATH } from '@/components/guidos/stockist-map-data';
import {
  GREATER_VICTORIA,
  MAP_EXTENT,
  isInsideCoverage,
  project,
  unproject,
  viewBoxAttr,
  type LatLng,
  type MapPoint,
  type ViewBox,
} from '@/components/guidos/stockist-map-geometry';

type Neighbour = { id: string; name: string; lat: number; lng: number };

const ASPECT = 16 / 10;
// View widths in map units (4 km up to the whole area the map covers)
const WHOLE_AREA = Math.ceil(MAP_EXTENT.h * ASPECT);
const SPANS = [400, 800, 1600, 3200, 6400, WHOLE_AREA];
const DRAG_THRESHOLD = 4; // px a press may wander and still count as a click

function boxAround(centre: MapPoint, w: number): ViewBox {
  const h = w / ASPECT;
  // Wider or taller than the drawn area: centre it, with sea either side
  const x = w >= MAP_EXTENT.w ? (MAP_EXTENT.w - w) / 2 : Math.min(Math.max(centre.x - w / 2, 0), MAP_EXTENT.w - w);
  const y = h >= MAP_EXTENT.h ? (MAP_EXTENT.h - h) / 2 : Math.min(Math.max(centre.y - h / 2, 0), MAP_EXTENT.h - h);
  return { x, y, w, h };
}

/**
 * Click the map to place or move the pin, and drag it to look around. Other
 * stockists show faintly for context. With the map focused, Enter drops the
 * pin in the middle of the view and the arrow keys move it, about 20 metres
 * a press, or a twentieth of the view with Shift held.
 */
export default function StockistMapPicker({
  value,
  onChange,
  neighbours,
}: {
  value: LatLng | null;
  onChange: (next: LatLng) => void;
  neighbours: Neighbour[];
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; from: MapPoint; moved: boolean } | null>(null);
  const [spanIndex, setSpanIndex] = useState(value ? 1 : 3);
  const pin = value ? project(value) : null;
  // Follow the pin when it moves from outside (an address was chosen), but
  // keep the view still while the admin is clicking within it.
  const [centre, setCentre] = useState(pin ?? GREATER_VICTORIA);
  // Compared by coordinates: the form passes a new object on every render
  const [prevValue, setPrevValue] = useState(value);
  if (value?.lat !== prevValue?.lat || value?.lng !== prevValue?.lng) {
    setPrevValue(value);
    if (value && pin) {
      const box = boxAround(centre, SPANS[spanIndex]);
      const outside = pin.x < box.x || pin.x > box.x + box.w || pin.y < box.y || pin.y > box.y + box.h;
      if (outside) setCentre(pin);
    }
  }

  const box = useMemo(() => boxAround(centre, SPANS[spanIndex]), [centre, spanIndex]);
  const boxCentre = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
  const unit = box.w / 100; // one hundredth of the view, for sizing marks

  const place = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    const next = unproject({ x: pt.x, y: pt.y });
    if (isInsideCoverage(next)) onChange(next);
  };

  const dropAtCentre = () => {
    const next = unproject(boxCentre);
    if (isInsideCoverage(next)) onChange(next);
  };

  const nudge = (dx: number, dy: number) => {
    if (!pin) return dropAtCentre();
    const next = unproject({ x: pin.x + dx, y: pin.y + dy });
    if (isInsideCoverage(next)) onChange(next);
  };

  /* A press that stays put places the pin; one that moves pans the view */
  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, from: boxCentre, moved: false };
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    d.moved = true;
    // The whole area is already in view at the widest zoom: nothing to pan
    if (spanIndex === SPANS.length - 1) return;
    const perPx = box.w / e.currentTarget.getBoundingClientRect().width;
    // Keep the centre where the drawn view actually is, so a drag past an
    // edge does not leave a hidden offset for the next zoom to jump to
    const next = boxAround({ x: d.from.x - dx * perPx, y: d.from.y - dy * perPx }, box.w);
    setCentre({ x: next.x + next.w / 2, y: next.y + next.h / 2 });
  };
  const onPointerUp = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) place(e.clientX, e.clientY);
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const step = e.shiftKey ? box.w / 20 : 2; // 2 map units is about 20 metres
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      nudge(...moves[e.key]);
    } else if ((e.key === 'Enter' || e.key === ' ') && !pin) {
      e.preventDefault();
      dropAtCentre();
    }
  };

  return (
    <div className="admin-field">
      <span className="admin-field__label">Pin on the map</span>
      <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)' }}>
        <svg
          ref={svgRef}
          viewBox={viewBoxAttr(box)}
          preserveAspectRatio="xMidYMid slice"
          role="application"
          aria-label={
            pin
              ? 'Map with the pin placed. Click to move it, drag to look around, or use the arrow keys.'
              : 'Map. Click to place the pin, drag to look around, or press Enter to drop it in the middle.'
          }
          tabIndex={0}
          style={{ display: 'block', width: '100%', aspectRatio: `${ASPECT}`, background: '#DCE6E8', cursor: 'crosshair', touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { drag.current = null; }}
          onKeyDown={onKeyDown}
        >
          <path d={LAND_PATH} fill="#F4EEDE" fillRule="evenodd" stroke="#B9A37A" strokeWidth={unit * 0.12} />
          <path d={ROADS_PATH} fill="none" stroke="#C9B48A" strokeWidth={unit * 0.25} strokeLinecap="round" strokeLinejoin="round" />
          {neighbours.map((n) => {
            const p = project(n);
            return <circle key={n.id} cx={p.x} cy={p.y} r={unit * 0.9} fill="#7C591D" opacity={0.45}><title>{n.name}</title></circle>;
          })}
          {pin && (
            <g>
              <circle cx={pin.x} cy={pin.y} r={unit * 2.6} fill="#1C6B4A" opacity={0.18} />
              <circle cx={pin.x} cy={pin.y} r={unit * 1.3} fill="#1C6B4A" stroke="#fff" strokeWidth={unit * 0.45} />
            </g>
          )}
        </svg>
        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button type="button" className="admin-btn admin-btn--sm" aria-label="Zoom in" disabled={spanIndex === 0} onClick={() => setSpanIndex((i) => Math.max(0, i - 1))}>+</button>
          <button type="button" className="admin-btn admin-btn--sm" aria-label="Zoom out" disabled={spanIndex === SPANS.length - 1} onClick={() => setSpanIndex((i) => Math.min(SPANS.length - 1, i + 1))}>−</button>
        </div>
      </div>
      <p className="admin-field__help">
        {pin && value
          ? `Pinned at ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}. Click the map to fine-tune it, or drag to look around.`
          : 'Find the address above, or click the map to drop the pin. Drag the map, or zoom out, to reach places further up the Island.'}
      </p>
      <p className="admin-field__help" style={{ marginTop: '0.15rem' }}>
        Map data and address search{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>
          &copy; OpenStreetMap contributors
        </a>
      </p>
    </div>
  );
}
