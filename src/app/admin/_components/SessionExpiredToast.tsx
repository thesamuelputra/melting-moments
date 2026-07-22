'use client';

/**
 * Persistent (non-expiring) error toast shown when a server action reports
 * 'unauthorized': the admin session is gone, so every further save will fail.
 * Rendered with the UI-kit toast classes; the action link goes to /admin-login.
 * A full <a> navigation (not <Link>) is intentional: the session is dead, so a
 * hard navigation with a fresh server render is the safest path.
 */
export default function SessionExpiredToast({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        right: '1.25rem',
        bottom: '1.25rem',
        zIndex: 401,
        maxWidth: 'min(360px, calc(100vw - 2.5rem))',
      }}
    >
      <div className="admin-toast admin-toast--error" style={{ alignItems: 'center' }}>
        <span className="admin-toast__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="7.5" x2="12" y2="13" />
            <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
          </svg>
        </span>
        <p className="admin-toast__message">Session expired. Log in again</p>
        <a href="/admin-login" className="admin-btn admin-btn--sm" style={{ flexShrink: 0 }}>
          Log in
        </a>
      </div>
    </div>
  );
}
