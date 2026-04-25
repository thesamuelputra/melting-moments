'use client';

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
 
export default function NotFound() {
  const pathname = usePathname();
  
  // Log 404 hits for detecting broken external links (#30)
  useEffect(() => {
    console.warn(`[404] Page not found: ${pathname}`);
  }, [pathname]);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: 'var(--clr-bone)', color: 'var(--clr-ink)', padding: '2rem' }}>
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
