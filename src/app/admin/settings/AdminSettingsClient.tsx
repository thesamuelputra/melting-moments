'use client';

import { useState, useTransition } from 'react';
import { saveBusinessSettings } from './actions';

export type SettingsMap = {
  name: string;
  owner: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  emailOnNewInquiry: string;
  emailOnBooking: string;
  weeklyDigest: string;
};

export default function AdminSettingsClient({ initialSettings }: { initialSettings: SettingsMap }) {
  const [business, setBusiness] = useState({
    name: initialSettings.name || 'Melting Moments Catering',
    owner: initialSettings.owner || 'Paul Silletta',
    address: initialSettings.address || '614 Grenville Ave, Esquimalt, BC V9A 6L2',
    phone: initialSettings.phone || '250-385-2462',
    email: initialSettings.email || 'info@meltingmoments.ca',
    website: initialSettings.website || 'https://meltingmoments.ca',
  });

  const [notifications, setNotifications] = useState({
    emailOnNewInquiry: initialSettings.emailOnNewInquiry === 'true',
    emailOnBooking: initialSettings.emailOnBooking === 'true',
    weeklyDigest: initialSettings.weeklyDigest === 'true',
  });

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const payload = {
        name: business.name,
        owner: business.owner,
        address: business.address,
        phone: business.phone,
        email: business.email,
        website: business.website,
        emailOnNewInquiry: notifications.emailOnNewInquiry ? 'true' : 'false',
        emailOnBooking: notifications.emailOnBooking ? 'true' : 'false',
        weeklyDigest: notifications.weeklyDigest ? 'true' : 'false',
      };
      const res = await saveBusinessSettings(payload);
      if (res.success) {
        setSaved(true);
        setSaveError('');
        setTimeout(() => setSaved(false), 2500);
      } else {
        setSaveError('Failed to save settings. Please try again.');
      }
    });
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      {saveError && (
        <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1rem', background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.2)', color: '#B91C1C', fontSize: '0.85rem', borderRadius: '6px' }}>
          {saveError}
        </div>
      )}
      <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '6px', lineHeight: 1.5 }}>
        Changes saved here are automatically reflected on the public <strong>Contact</strong> and <strong>Corporate</strong> pages.
      </p>
      {/* Business Information */}
      <div className="admin-section">
        <div className="admin-section__header">
          <h3>Business Information</h3>
        </div>
        <div className="admin-section__body">
          <div style={{ display: 'grid', gap: '1.25rem', opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
            <div>
              <label className="admin-modal__label" style={{ marginBottom: '0.5rem' }}>Business Name</label>
              <input
                className="admin-inline-input"
                value={business.name}
                onChange={e => setBusiness({ ...business, name: e.target.value })}
                disabled={isPending}
              />
            </div>
            <div>
              <label className="admin-modal__label" style={{ marginBottom: '0.5rem' }}>Owner / Chef</label>
              <input
                className="admin-inline-input"
                value={business.owner}
                onChange={e => setBusiness({ ...business, owner: e.target.value })}
                disabled={isPending}
              />
            </div>
            <div>
              <label className="admin-modal__label" style={{ marginBottom: '0.5rem' }}>Address</label>
              <input
                className="admin-inline-input"
                value={business.address}
                onChange={e => setBusiness({ ...business, address: e.target.value })}
                disabled={isPending}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="admin-modal__label" style={{ marginBottom: '0.5rem' }}>Phone</label>
                <input
                  className="admin-inline-input"
                  value={business.phone}
                  onChange={e => setBusiness({ ...business, phone: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="admin-modal__label" style={{ marginBottom: '0.5rem' }}>Email</label>
                <input
                  className="admin-inline-input"
                  value={business.email}
                  onChange={e => setBusiness({ ...business, email: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>
            <div>
              <label className="admin-modal__label" style={{ marginBottom: '0.5rem' }}>Website</label>
              <input
                className="admin-inline-input"
                value={business.website}
                onChange={e => setBusiness({ ...business, website: e.target.value })}
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="admin-section">
        <div className="admin-section__header">
          <h3>Notifications</h3>
        </div>
        <div className="admin-section__body">
          <div style={{ display: 'grid', gap: '1rem', opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
            {[
              { key: 'emailOnNewInquiry' as const, label: 'Email on new inquiry', desc: 'Get notified when a new contact form is submitted.' },
              { key: 'emailOnBooking' as const, label: 'Email on booking confirmation', desc: 'Get notified when an inquiry is marked as booked.' },
              { key: 'weeklyDigest' as const, label: 'Weekly digest', desc: 'Receive a summary of inquiries and events every Monday.' },
            ].map(pref => (
              <label key={pref.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: isPending ? 'default' : 'pointer' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{pref.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.15rem' }}>{pref.desc}</div>
                </div>
                <div
                  onClick={() => !isPending && setNotifications(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                  style={{
                    width: '40px',
                    height: '22px',
                    borderRadius: '11px',
                    backgroundColor: notifications[pref.key] ? 'var(--clr-ink)' : 'rgba(0,0,0,0.15)',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                    cursor: isPending ? 'default' : 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: '3px',
                    left: notifications[pref.key] ? '21px' : '3px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </div>
              </label>
            ))}
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(217, 119, 6, 0.05)', borderLeft: '3px solid #D97706', fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.5 }}>
            <strong>Coming Soon:</strong> Notification preferences are saved to your account. Email delivery requires the <code>RESEND_API_KEY</code> environment variable to be configured. The &quot;Email on new inquiry&quot; feature is active when Resend is configured.
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button className="admin-btn admin-btn--primary" onClick={handleSave} style={{ padding: '0.7rem 2rem' }} disabled={isPending}>
          {isPending ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
        {saved && <span style={{ fontSize: '0.8rem', color: '#059669' }}>Changes saved successfully.</span>}
      </div>
    </div>
  );
}
