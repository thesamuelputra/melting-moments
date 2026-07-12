'use client'

import { useEffect } from 'react'

// Catches errors thrown by the root layout itself (error.tsx only covers the
// page subtree). Replaces the <html> document, so globals.css and CSS vars
// are unavailable; colors and fonts are hardcoded to match the brand.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Georgia, "Times New Roman", serif' }}>
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: '#F7F6F0', color: '#111111', padding: '2rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '2rem', opacity: 0.6 }}>Melting Moments</div>
          <h1 style={{ textTransform: 'uppercase', marginBottom: '2rem', fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1, fontWeight: 400 }}>Something went wrong</h1>
          <p style={{ maxWidth: '50ch', opacity: 0.8, marginBottom: '3rem', lineHeight: 1.6 }}>
            An unexpected error occurred. Please try again, or call us at{' '}
            <a href="tel:+12503852462" style={{ color: '#111111' }}>250-385-2462</a> and we&apos;ll take care of you directly.
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: '1rem 2.5rem', backgroundColor: '#111111', color: '#F7F6F0', border: 'none', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
