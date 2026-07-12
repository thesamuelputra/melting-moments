'use client';

export type SkeletonRowsProps = {
  rows: number;
  cols: number;
};

// Deterministic width sequence (no Math.random; SSR/hydration safe).
const WIDTHS = [82, 58, 91, 66, 74, 48];

export default function SkeletonRows({ rows, cols }: SkeletonRowsProps) {
  return (
    <div className="admin-skeleton-rows" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, r) => (
        <div
          key={r}
          className="admin-skeleton-row"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          aria-hidden="true"
        >
          {Array.from({ length: cols }, (_, c) => (
            <span
              key={c}
              className="admin-skeleton"
              style={{ width: `${WIDTHS[(r * 2 + c * 3) % WIDTHS.length]}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
