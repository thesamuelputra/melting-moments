type Tone = 'ink' | 'cream';

const GOLD: Record<Tone, string> = { ink: '#7C591D', cream: '#C2A24E' };

/**
 * A small centered flourish for section breaks: a thin gold rule on each side
 * of a laurel-and-bean motif. Echoes the gold dividers on the packaging.
 */
export default function GuidosOrnament({ tone = 'ink', width = 200 }: { tone?: Tone; width?: number }) {
  const gold = GOLD[tone];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', width: '100%' }} aria-hidden="true">
      <span style={{ height: '1px', width: width / 2, maxWidth: '30vw', background: `linear-gradient(to right, transparent, ${gold})` }} />
      <svg viewBox="0 0 44 24" width="40" height="22" style={{ display: 'block', flexShrink: 0 }}>
        {/* two laurel leaves meeting at a center bean */}
        <ellipse cx="14" cy="12" rx="7" ry="3" fill={gold} transform="rotate(-18 14 12)" />
        <ellipse cx="30" cy="12" rx="7" ry="3" fill={gold} transform="rotate(18 30 12)" />
        <circle cx="22" cy="12" r="2.4" fill={gold} />
      </svg>
      <span style={{ height: '1px', width: width / 2, maxWidth: '30vw', background: `linear-gradient(to left, transparent, ${gold})` }} />
    </div>
  );
}
