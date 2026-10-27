import type { CSSProperties } from 'react';

type Tone = 'ink' | 'cream';

const TONES: Record<Tone, { text: string; gold: string; ring: string }> = {
  ink: { text: '#211C13', gold: '#7C591D', ring: 'rgba(124,89,29,0.6)' },
  cream: { text: '#F4EEDE', gold: '#C2A24E', ring: 'rgba(194,162,78,0.65)' },
};

const RED = '#C13A2E';
const GREEN = '#1C6B4A';

/** Five hardcoded leaves forming one laurel sprig (right side); the left is a
 *  mirror. Tuned by eye to sit alongside the wordmark. */
const LEAVES = [
  { x: 6, y: 62, r: 38 },
  { x: 10, y: 49, r: 30 },
  { x: 13, y: 36, r: 22 },
  { x: 15, y: 23, r: 14 },
  { x: 16, y: 11, r: 6 },
];

function LaurelSprig({ gold, flip }: { gold: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 28 72" aria-hidden="true" style={{ width: 'calc(var(--g-word) * 0.3125)', height: 'auto', transform: flip ? 'scaleX(-1)' : undefined, display: 'block' }}>
      <path d="M4 70 C 2 48, 6 24, 18 4" fill="none" stroke={gold} strokeWidth="1.4" strokeLinecap="round" />
      {LEAVES.map((leaf, i) => (
        <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r})`}>
          <ellipse cx="0" cy="0" rx="3.1" ry="6.6" fill={gold} />
        </g>
      ))}
    </svg>
  );
}

/** The circular crest: a double gold ring, a tricolour swoosh across the top,
 *  and a serif G. Mirrors the monogram on the delivery van. A number is a
 *  pixel size; a string is any CSS length, so the crest can scale with type. */
export function GuidosCrest({ tone = 'ink', size = 88 }: { tone?: Tone; size?: number | string }) {
  const c = TONES[tone];
  const sized = typeof size === 'number' ? { width: size, height: size } : {};
  return (
    <svg viewBox="0 0 100 100" {...sized} role="img" aria-label="Guido's Gourmet" style={{ display: 'block', ...(typeof size === 'string' ? { width: size, height: size } : {}) }}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={c.ring} strokeWidth="1.4" />
      <circle cx="50" cy="50" r="41.5" fill="none" stroke={c.ring} strokeWidth="0.7" />
      {/* Tricolour swoosh over the top, cream gap left showing at 12 o'clock */}
      <path d="M15.2 37.4 A 37 37 0 0 1 43.6 13.6" fill="none" stroke={GREEN} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M56.4 13.6 A 37 37 0 0 1 84.8 37.4" fill="none" stroke={RED} strokeWidth="3.6" strokeLinecap="round" />
      <text x="50" y="66" textAnchor="middle" fill={c.text} style={{ font: "400 46px 'Instrument Serif', Georgia, serif" }}>G</text>
    </svg>
  );
}

/**
 * Full Guido's lockup: crest, laurel-flanked GUIDO'S, then GOURMET with side
 * rules, and an optional script tagline. Built entirely from SVG and web text
 * so it is crisp at any size and needs no raster asset. Every part is sized
 * from wordSize, so the lockup keeps its proportions at any scale.
 */
export default function GuidosWordmark({
  tone = 'ink',
  showCrest = true,
  tagline,
  style,
  wordSize = 'clamp(2.4rem, 6vw, 4rem)',
}: {
  tone?: Tone;
  showCrest?: boolean;
  tagline?: string;
  style?: CSSProperties;
  wordSize?: string;
}) {
  const c = TONES[tone];
  return (
    <div
      className="g-wordmark"
      style={{ '--g-word': wordSize, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'calc(var(--g-word) * 0.16)', ...style } as CSSProperties}
    >
      {showCrest && <GuidosCrest tone={tone} size="calc(var(--g-word) * 1.1)" />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--g-word) * 0.15)' }}>
        <LaurelSprig gold={c.gold} />
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--g-word)',
            lineHeight: 0.9,
            letterSpacing: '0.04em',
            color: c.text,
            whiteSpace: 'nowrap',
          }}
        >
          GUIDO&rsquo;S
        </span>
        <LaurelSprig gold={c.gold} flip />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--g-word) * 0.19)' }}>
        <span style={{ width: 'calc(var(--g-word) * 0.62)', height: '1px', background: c.gold }} aria-hidden="true" />
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'max(10px, calc(var(--g-word) * 0.148))',
            letterSpacing: '0.42em',
            textIndent: '0.42em',
            fontWeight: 500,
            color: c.gold,
          }}
        >
          GOURMET
        </span>
        <span style={{ width: 'calc(var(--g-word) * 0.62)', height: '1px', background: c.gold }} aria-hidden="true" />
      </div>

      {tagline && (
        <span className="g-script" style={{ color: c.gold, fontSize: 'calc(var(--g-word) * 0.3)', marginTop: 'calc(var(--g-word) * 0.06)' }}>
          {tagline}
        </span>
      )}
    </div>
  );
}
