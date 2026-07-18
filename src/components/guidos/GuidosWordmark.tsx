import type { CSSProperties } from 'react';

type Tone = 'ink' | 'cream';

const TONES: Record<Tone, { text: string; gold: string; ring: string }> = {
  ink: { text: '#211C13', gold: '#8A6320', ring: 'rgba(138,99,32,0.55)' },
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
    <svg viewBox="0 0 28 72" width="20" height="52" aria-hidden="true" style={{ transform: flip ? 'scaleX(-1)' : undefined, display: 'block' }}>
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
 *  and a serif G. Mirrors the monogram on the delivery van. */
export function GuidosCrest({ tone = 'ink', size = 88 }: { tone?: Tone; size?: number }) {
  const c = TONES[tone];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Guido's Gourmet" style={{ display: 'block' }}>
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
 * so it is crisp at any size and needs no raster asset.
 */
export default function GuidosWordmark({
  tone = 'ink',
  showCrest = true,
  tagline,
  style,
  crestSize = 84,
  wordSize = 'clamp(2.4rem, 6vw, 4rem)',
}: {
  tone?: Tone;
  showCrest?: boolean;
  tagline?: string;
  style?: CSSProperties;
  crestSize?: number;
  wordSize?: string;
}) {
  const c = TONES[tone];
  return (
    <div className="g-wordmark" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem', ...style }}>
      {showCrest && <GuidosCrest tone={tone} size={crestSize} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <LaurelSprig gold={c.gold} />
        <span
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: wordSize,
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ width: 'clamp(20px, 4vw, 40px)', height: '1px', background: c.gold }} aria-hidden="true" />
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 'clamp(0.7rem, 1.4vw, 0.95rem)',
            letterSpacing: '0.42em',
            textIndent: '0.42em',
            fontWeight: 500,
            color: c.gold,
          }}
        >
          GOURMET
        </span>
        <span style={{ width: 'clamp(20px, 4vw, 40px)', height: '1px', background: c.gold }} aria-hidden="true" />
      </div>

      {tagline && (
        <span className="g-script g-script--sm" style={{ color: c.gold, marginTop: '0.15rem' }}>
          {tagline}
        </span>
      )}
    </div>
  );
}
