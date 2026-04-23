import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: 'var(--clr-bone)', color: 'var(--clr-ink)', padding: '2rem' }}>
      <div className="menu-index" style={{ marginBottom: '2rem' }}>Error 404</div>
      <h1 className="haus-display" style={{ textTransform: 'uppercase', marginBottom: '2rem' }}>Page Not Found</h1>
      <p style={{ fontSize: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', maxWidth: '50ch', opacity: 0.8, marginBottom: '4rem' }}>
        The culinary experience you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="btn-solid">
        Return Home
      </Link>
    </div>
  )
}
