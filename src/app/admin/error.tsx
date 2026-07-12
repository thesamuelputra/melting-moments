'use client'; // Error boundaries must be Client Components

import Link from 'next/link';

export default function AdminError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  // Next 16 passes unstable_retry (re-fetch + re-render); reset is the
  // legacy fallback that only clears the boundary state.
  unstable_retry?: () => void;
}) {
  const retry = unstable_retry ?? reset;
  const isAuthError =
    error.message.includes('Unauthorized') || error.message.includes('admin session');

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', padding: '2rem' }}>
      <div className="admin-section" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '2.5rem 2rem' }}>
        {isAuthError ? (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginBottom: '0.75rem', color: 'var(--clr-ink)' }}>
              Session expired
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your admin session is no longer valid. Please sign in again to continue.
            </p>
            <Link href="/admin-login" className="admin-btn admin-btn--primary" style={{ textDecoration: 'none' }}>
              Go to login
            </Link>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginBottom: '0.75rem', color: 'var(--clr-ink)' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              An unexpected error occurred while loading this page. Your data is safe. Try again, and if the problem persists, refresh the browser.
              {error.digest && (
                <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.7rem', color: 'rgba(0,0,0,0.35)' }}>
                  Error reference: {error.digest}
                </span>
              )}
            </p>
            <button className="admin-btn admin-btn--primary" onClick={() => retry()}>
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
