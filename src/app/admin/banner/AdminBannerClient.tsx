'use client';

import { useState, useTransition } from 'react';
import { saveBanner } from '../content/actions';

type Style = 'dark' | 'accent' | 'light';

type BannerData = {
  enabled: boolean;
  text: string;
  link: string;
  style: Style;
};

const STYLE_PREVIEWS: Record<Style, { bg: string; color: string; label: string }> = {
  dark: { bg: '#111111', color: '#F5F0E8', label: 'Dark (default)' },
  accent: { bg: '#1a1a2e', color: '#E2C992', label: 'Midnight Gold' },
  light: { bg: '#F5F0E8', color: '#111111', label: 'Light / Bone' },
};

export default function AdminBannerClient({ initial }: { initial: BannerData }) {
  const [data, setData] = useState<BannerData>(initial);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const update = (patch: Partial<BannerData>) => {
    setData(prev => ({ ...prev, ...patch }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveBanner(data);
      if (res.success) {
        setDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  const preview = STYLE_PREVIEWS[data.style];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400 }}>Announcement Banner</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.25rem' }}>
            A slim bar pinned above the navigation on every public page
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {dirty && <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 500 }}>Unsaved changes</span>}
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={isPending || !dirty}
          >
            {isPending ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div style={{ marginBottom: '2rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Live Preview
        </div>
        <div style={{
          backgroundColor: preview.bg,
          color: preview.color,
          padding: '0.65rem 3rem',
          textAlign: 'center',
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 500,
          opacity: data.enabled ? 1 : 0.3,
          position: 'relative',
          minHeight: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {data.text || 'Your announcement text will appear here'}
          {data.link && <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>→</span>}
          {!data.enabled && (
            <span style={{ position: 'absolute', right: '1rem', fontSize: '0.65rem', opacity: 0.5, background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              DISABLED
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="admin-section" style={{ padding: '1.5rem' }}>
        {/* Enable toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Enable Banner</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.2rem' }}>Toggle banner visibility across all public pages</div>
          </div>
          <button
            onClick={() => update({ enabled: !data.enabled })}
            style={{
              width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
              backgroundColor: data.enabled ? '#111111' : 'rgba(0,0,0,0.12)',
              position: 'relative', transition: 'background-color 0.2s ease',
            }}
          >
            <span style={{
              position: 'absolute', top: '3px', left: data.enabled ? '25px' : '3px',
              width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
              transition: 'left 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* Text */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="admin-modal__label">Banner Text *</label>
          <p style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.3)', marginBottom: '0.5rem' }}>Keep it short. Under 80 characters works best</p>
          <input
            className="admin-inline-input"
            value={data.text}
            onChange={e => update({ text: e.target.value })}
            placeholder="Now booking 2027 Wedding Season. Limited dates available"
            maxLength={120}
          />
          <div style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.3)', marginTop: '0.3rem', textAlign: 'right' }}>{data.text.length}/120</div>
        </div>

        {/* Link */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="admin-modal__label">Link (Optional)</label>
          <p style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.3)', marginBottom: '0.5rem' }}>Where clicking the banner takes visitors. Leave blank for no link</p>
          <input
            className="admin-inline-input"
            value={data.link}
            onChange={e => update({ link: e.target.value })}
            placeholder="/contact or https://..."
          />
        </div>

        {/* Style */}
        <div>
          <label className="admin-modal__label" style={{ marginBottom: '0.75rem' }}>Banner Style</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {(Object.keys(STYLE_PREVIEWS) as Style[]).map(style => (
              <button
                key={style}
                onClick={() => update({ style })}
                style={{
                  border: data.style === style ? '2px solid #111' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', background: 'none', padding: 0,
                  boxShadow: data.style === style ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <div style={{ backgroundColor: STYLE_PREVIEWS[style].bg, color: STYLE_PREVIEWS[style].color, padding: '0.75rem', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Preview
                </div>
                <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.65rem', color: 'rgba(0,0,0,0.5)', background: 'white', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  {STYLE_PREVIEWS[style].label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
