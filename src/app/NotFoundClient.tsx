'use client';

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const linkStyle = {
  textDecoration: 'underline',
  display: 'flex',
  alignItems: 'center',
  minHeight: '44px',
};

export default function NotFoundClient() {
  const pathname = usePathname();
  const isGuidosPath = pathname?.startsWith('/guidos');

  // Log 404 hits to help spot broken external links
  useEffect(() => {
    console.warn(`[404] Page not found: ${pathname}`);
  }, [pathname]);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: 'var(--clr-bone)', color: 'var(--clr-ink)', padding: '2rem' }}>
      <div className="menu-index" style={{ marginBottom: '2rem' }}>Error 404</div>
      <h1 className="haus-display" style={{ textTransform: 'uppercase', marginBottom: '2rem' }}>Page Not Found</h1>
      <p style={{ fontSize: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', maxWidth: '50ch', opacity: 0.8, marginBottom: '3rem' }}>
        {isGuidosPath
          ? "The meal you are looking for does not exist or has been moved."
          : "The culinary experience you are looking for does not exist or has been moved."
        }
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn-solid">
          Return Home
        </Link>
        {isGuidosPath ? (
          <Link href="/guidos/menu" className="btn-outline">
            View Menu
          </Link>
        ) : (
          <Link href="/menus" className="btn-outline">
            View Menus
          </Link>
        )}
      </div>
      {/* These are the way out for someone who is already lost, so they get a
          full tap target and enough contrast to read: at 0.4 the ink came out
          around 2.7:1 on bone, well under AA. */}
      <div style={{ marginTop: '3rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '2rem', opacity: 0.7, fontSize: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        <Link href="/menus" style={linkStyle}>Catering</Link>
        <Link href="/guidos" style={linkStyle}>Ready-Made Meals</Link>
        <Link href="/contact" style={linkStyle}>Contact</Link>
      </div>
    </div>
  )
}
