'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { saveBusinessSettings } from './actions';
import { TextField, ToggleSwitch, useDirtyGuard, useToast } from '../_components';
import { validateSettingsEntries } from './validation';

/**
 * Editor defaults mirror the live-site fallbacks: every consumer reads
 * `settings[key] || fallback`, so pre-filling the fallback shows the admin
 * exactly what is live without forcing a save.
 */
const TEXT_DEFAULTS = {
  name: 'Melting Moments Catering',
  owner: 'Paul Silletta',
  address: '614 Grenville Ave, Esquimalt, BC V9A 6L2',
  phone: '250-385-2462',
  email: 'info@meltingmoments.ca',
  website: 'https://meltingmoments.ca',
  social_instagram: '',
  social_facebook: 'https://www.facebook.com/MeltingMomentsCatering',
  social_google_business: '',
  business_hours_note: 'Consultations & tastings by appointment',
} as const;

type TextKey = keyof typeof TEXT_DEFAULTS;

type Draft = Record<TextKey, string> & { emailOnNewInquiry: boolean };

function buildDraft(initialSettings: Record<string, string>): Draft {
  const draft = {} as Draft;
  for (const key of Object.keys(TEXT_DEFAULTS) as TextKey[]) {
    draft[key] = initialSettings[key] || TEXT_DEFAULTS[key];
  }
  // Missing = on: the contact route only skips the owner email when the
  // stored value is exactly 'false'.
  draft.emailOnNewInquiry = initialSettings['emailOnNewInquiry'] !== 'false';
  return draft;
}

function draftToEntries(draft: Draft): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const key of Object.keys(TEXT_DEFAULTS) as TextKey[]) {
    entries[key] = draft[key];
  }
  entries.emailOnNewInquiry = draft.emailOnNewInquiry ? 'true' : 'false';
  return entries;
}

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

const JSONLD_HELP = "Feeds the site's structured data (JSON-LD) that search engines read.";

export default function AdminSettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [baseline, setBaseline] = useState<Draft>(() => buildDraft(initialSettings));
  const [draft, setDraft] = useState<Draft>(() => buildDraft(initialSettings));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline]);
  useDirtyGuard(dirty);

  const setField = (key: TextKey, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSave = () => {
    const entries = draftToEntries(draft);
    const validationErrors = validateSettingsEntries(entries);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Fix the highlighted fields before saving');
      return;
    }

    // Dirty-key diff: persist only what changed.
    const baseEntries = draftToEntries(baseline);
    const payload: Record<string, string> = {};
    for (const [key, value] of Object.entries(entries)) {
      if (value !== baseEntries[key]) payload[key] = value;
    }
    if (Object.keys(payload).length === 0) {
      toast.info('Nothing to save');
      return;
    }

    startTransition(async () => {
      const res = await saveBusinessSettings(payload).catch(
        () => ({ success: false as const, error: 'failed' as const })
      );
      if (res.success) {
        setBaseline(draft);
        setSessionExpired(false);
        toast.success('Settings saved');
      } else if (res.error === 'unauthorized') {
        setSessionExpired(true);
        toast.error('Session expired — log in again');
      } else {
        toast.error(('message' in res && res.message) || 'Failed to save settings — please try again');
      }
    });
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      {sessionExpired && <SessionExpiredNotice />}

      <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '6px', lineHeight: 1.5 }}>
        Changes saved here update the public <strong>Contact</strong> page and the business
        details search engines read from the site (JSON-LD schema).
      </p>

      {/* Business Profile */}
      <div className="admin-section">
        <div className="admin-section__header">
          <h3>Business Profile</h3>
        </div>
        <div className="admin-section__body">
          <div style={{ display: 'grid', gap: '1.25rem', opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
            <TextField
              label="Business Name"
              required
              value={draft.name}
              onChange={(v) => setField('name', v)}
              error={errors.name}
              disabled={isPending}
            />
            <TextField
              label="Owner / Chef"
              value={draft.owner}
              onChange={(v) => setField('owner', v)}
              help="Shown as the contact person on the Contact page."
              disabled={isPending}
            />
            <TextField
              label="Address"
              value={draft.address}
              onChange={(v) => setField('address', v)}
              disabled={isPending}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <TextField
                label="Phone"
                type="tel"
                value={draft.phone}
                onChange={(v) => setField('phone', v)}
                error={errors.phone}
                disabled={isPending}
              />
              <TextField
                label="Email"
                type="email"
                value={draft.email}
                onChange={(v) => setField('email', v)}
                error={errors.email}
                disabled={isPending}
              />
            </div>
            <TextField
              label="Website"
              type="url"
              value={draft.website}
              onChange={(v) => setField('website', v)}
              error={errors.website}
              placeholder="https://…"
              disabled={isPending}
            />
            <TextField
              label="Instagram URL"
              type="url"
              value={draft.social_instagram}
              onChange={(v) => setField('social_instagram', v)}
              error={errors.social_instagram}
              placeholder="https://www.instagram.com/…"
              help={JSONLD_HELP}
              disabled={isPending}
            />
            <TextField
              label="Facebook URL"
              type="url"
              value={draft.social_facebook}
              onChange={(v) => setField('social_facebook', v)}
              error={errors.social_facebook}
              placeholder="https://www.facebook.com/…"
              help={JSONLD_HELP}
              disabled={isPending}
            />
            <TextField
              label="Google Business Profile URL"
              type="url"
              value={draft.social_google_business}
              onChange={(v) => setField('social_google_business', v)}
              error={errors.social_google_business}
              placeholder="https://maps.google.com/…"
              help={JSONLD_HELP}
              disabled={isPending}
            />
            <TextField
              label="Hours note"
              value={draft.business_hours_note}
              onChange={(v) => setField('business_hours_note', v)}
              placeholder="Consultations & tastings by appointment"
              help={`Short opening-hours note, e.g. 'Consultations & tastings by appointment'. ${JSONLD_HELP}`}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="admin-section">
        <div className="admin-section__header">
          <h3>Notifications</h3>
        </div>
        <div className="admin-section__body">
          <div style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
            <ToggleSwitch
              label="Email on new inquiry"
              checked={draft.emailOnNewInquiry}
              onChange={(checked) => setDraft((prev) => ({ ...prev, emailOnNewInquiry: checked }))}
              help="Send an email to the owner inbox when a new contact form is submitted. Customers always receive their confirmation email."
              disabled={isPending}
            />
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(0,0,0,0.02)', borderLeft: '3px solid rgba(0,0,0,0.15)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.5 }}>
            Email delivery requires the <code>RESEND_API_KEY</code> environment variable. When it is
            not configured, no emails are sent regardless of this setting.
          </div>
        </div>
      </div>

      {/* Save */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          className="admin-btn admin-btn--primary"
          onClick={handleSave}
          style={{ padding: '0.7rem 2rem' }}
          disabled={isPending || !dirty}
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
        {dirty && !isPending && (
          <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 500 }}>Unsaved changes</span>
        )}
      </div>
    </div>
  );
}
