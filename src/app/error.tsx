'use client'
 
import { useEffect } from 'react'
 
export default function Error({
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: 'var(--clr-bone)', color: 'var(--clr-ink)', padding: '2rem' }}>
      <div className="menu-index" style={{ marginBottom: '2rem' }}>System Error</div>
      <h1 className="haus-display" style={{ textTransform: 'uppercase', marginBottom: '2rem', fontSize: 'clamp(3rem, 8vw, 6rem)' }}>Something went wrong!</h1>
      <p style={{ fontSize: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', maxWidth: '50ch', opacity: 0.8, marginBottom: '4rem' }}>
        An unexpected error occurred while preparing your request.
      </p>
      <button onClick={() => reset()} className="btn-solid">
        Try Again
      </button>
    </div>
  )
}
