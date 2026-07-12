'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { saveBanner } from '../content/actions';
import { TextField, ToggleSwitch, useDirtyGuard, useToast } from '../_components';
import {
  BANNER_LINK_ERROR,
  BANNER_TEXT_ERROR,
  isValidBannerLink,
  type BannerShowOn,
  type BannerStyle,
} from './validation';

export type BannerFormData = {
  enabled: boolean;
  text: string;
  link: string;
  style: BannerStyle;
  showOn: BannerShowOn;
};

const STYLE_PREVIEWS: Record<BannerStyle, { bg: string; color: string; label: string }> = {
  dark: { bg: '#111111', color: '#F5F0E8', label: 'Dark (default)' },
  accent: { bg: '#1a1a2e', color: '#E2C992', label: 'Midnight Gold' },
  light: { bg: '#F5F0E8', color: '#111111', label: 'Light / Bone' },
};

const SHOW_ON_OPTIONS: { value: BannerShowOn; label: string; desc: string }[] = [
  { value: 'all', label: 'All Pages', desc: 'Every public page' },
  { value: 'catering', label: 'Catering Only', desc: "All pages except Guido's" },
  { value: 'guidos', label: "Guido's Only", desc: "Guido's pages only" },
  { value: 'home', label: 'Homepage Only', desc: 'The front page only' },
];

function SessionExpiredNotice() {
  return (
    <div
      role="alert"
      style={{
        marginBottom: '1rem', padding: '0.875rem 1rem', background: 'rgba(185,28,28,0.05)',
        border: '1px solid rgba(185,28,28,0.2)', color: '#B91C1C', fontSize: '0.85rem', borderRadius: '6px',
        display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
      }}
    >
      <span>Session expired — log in again to keep editing.</span>
      <Link href="/admin-login" className="admin-btn admin-btn--sm" style={{ textDecoration: 'none' }}>
        Log in
      </Link>
    </div>
  );
}

export default function AdminBannerClient({ initial }: { initial: BannerFormData }) {
  const [baseline, setBaseline] = useState<BannerFormData>(initial);
  const [data, setData] = useState<BannerFormData>(initial);
  const [errors, setErrors] = useState<{ text?: string; link?: string }>({});
  const [saveError, setSaveError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(baseline), [data, baseline]);
  useDirtyGuard(dirty);

  const update = (patch: Partial<BannerFormData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    if ('text' in patch) setErrors((prev) => ({ ...prev, text: undefined }));
    if ('link' in patch) setErrors((prev) => ({ ...prev, link: undefined }));
  };

  const handleSave = () => {
    // Client-side validation (the server action re-checks everything).
    const validationErrors: { text?: string; link?: string } = {};
    if (data.enabled && data.text.trim() === '') validationErrors.text = BANNER_TEXT_ERROR;
    if (!isValidBannerLink(data.link)) validationErrors.link = BANNER_LINK_ERROR;
    setErrors(validationErrors);
    if (validationErrors.text || validationErrors.link) {
      toast.error('Fix the highlighted fields before saving');
      return;
    }

    startTransition(async () => {
      const res = await saveBanner(data).catch(
        () => ({ success: false as const, error: 'failed' as const })
      );
      if (res.success) {
        setBaseline(data);
        setSaveError('');
        setSessionExpired(false);
        toast.success('Banner saved — live site updated');
      } else if (res.error === 'unauthorized') {
        setSessionExpired(true);
        toast.error('Session expired — log in again');
      } else {
        const message = ('message' in res && res.message) || 'Failed to save the banner — please try again';
        setSaveError(message);
        toast.error(message);
      }
    });
  };

  // Unknown stored style (hand-edited data) must not crash the page.
  const preview = STYLE_PREVIEWS[data.style] ?? STYLE_PREVIEWS.dark;

  return (
    <div>
      {sessionExpired && <SessionExpiredNotice />}
      {saveError && !sessionExpired && (
        <div role="alert" style={{ marginBottom: '1rem', padding: '0.875rem 1rem', background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.2)', color: '#B91C1C', fontSize: '0.85rem', borderRadius: '6px' }}>
          {saveError}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400 }}>Announcement Banner</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.25rem' }}>
            A slim bar pinned above the navigation on the public site
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {dirty && <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 500 }}>Unsaved changes</span>}
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={isPending || !dirty}
          >
            {isPending ? 'Saving...' : 'Save Changes'}
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
        <div style={{ paddingBottom: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <ToggleSwitch
            label="Enable Banner"
            checked={data.enabled}
            onChange={(enabled) => update({ enabled })}
            help="Toggle banner visibility across public pages"
            disabled={isPending}
          />
        </div>

        {/* Text */}
        <div style={{ marginBottom: '1.25rem' }}>
          <TextField
            id="banner-text"
            label="Banner Text"
            required={data.enabled}
            value={data.text}
            onChange={(text) => update({ text })}
            error={errors.text}
            help="Keep it short. Under 80 characters works best"
            placeholder="Now booking 2027 Wedding Season. Limited dates available"
            maxLength={120}
            disabled={isPending}
          />
          <div style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.3)', marginTop: '0.3rem', textAlign: 'right' }}>{data.text.length}/120</div>
        </div>

        {/* Link */}
        <div style={{ marginBottom: '1.25rem' }}>
          <TextField
            id="banner-link"
            label="Link (Optional)"
            value={data.link}
            onChange={(link) => update({ link })}
            error={errors.link}
            help="Where clicking the banner takes visitors: a relative path (/contact) or an https:// URL. Leave blank for no link"
            placeholder="/contact or https://…"
            disabled={isPending}
          />
        </div>

        {/* Show On (Targeting) */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="admin-modal__label">Show On</label>
          <p style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.3)', marginBottom: '0.5rem' }}>Restrict the banner to specific sections of the site</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
            {SHOW_ON_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ showOn: opt.value })}
                aria-pressed={data.showOn === opt.value}
                disabled={isPending}
                style={{
                  padding: '0.6rem', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'center',
                  border: data.showOn === opt.value ? '2px solid #111' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '6px', background: data.showOn === opt.value ? 'rgba(0,0,0,0.03)' : 'white',
                  fontWeight: data.showOn === opt.value ? 600 : 400,
                }}
              >
                <span style={{ display: 'block' }}>{opt.label}</span>
                <span style={{ display: 'block', marginTop: '0.2rem', fontSize: '0.62rem', color: 'rgba(0,0,0,0.4)', fontWeight: 400 }}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div>
          <label className="admin-modal__label" style={{ marginBottom: '0.75rem' }}>Banner Style</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {(Object.keys(STYLE_PREVIEWS) as BannerStyle[]).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => update({ style })}
                aria-pressed={data.style === style}
                disabled={isPending}
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
