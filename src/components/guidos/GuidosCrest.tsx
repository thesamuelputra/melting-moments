type Tone = 'ink' | 'cream';

const TONES: Record<Tone, { text: string; ring: string }> = {
  ink: { text: '#070707', ring: 'rgba(7, 7, 7, 0.45)' },
  cream: { text: '#F3EAE1', ring: 'rgba(243, 234, 225, 0.55)' },
};

const RED = '#C13A2E';
const GREEN = '#1C6B4A';

/** The round Guido's mark: two thin rings, the tricolour swept over the top
 *  and a serif G, as painted on the delivery van. */
export function GuidosCrest({ tone = 'ink', size = 88 }: { tone?: Tone; size?: number }) {
  const c = TONES[tone];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Guido's Gourmet" style={{ display: 'block' }}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={c.ring} strokeWidth="1.4" />
      <circle cx="50" cy="50" r="41.5" fill="none" stroke={c.ring} strokeWidth="0.7" />
      {/* Tricolour over the top, with the paper showing through at twelve o'clock */}
      <path d="M15.2 37.4 A 37 37 0 0 1 43.6 13.6" fill="none" stroke={GREEN} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M56.4 13.6 A 37 37 0 0 1 84.8 37.4" fill="none" stroke={RED} strokeWidth="3.6" strokeLinecap="round" />
      <text x="50" y="66" textAnchor="middle" fill={c.text} style={{ font: "400 46px 'Instrument Serif', Georgia, serif" }}>G</text>
    </svg>
  );
}
