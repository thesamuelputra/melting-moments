import type { Viewport } from 'next';
import GuidosBar from '@/components/guidos/GuidosBar';
import './guidos.css';

/**
 * Scopes the Guido's Gourmet look to the /guidos subtree. Its styles live in
 * guidos.css, which only these routes load, and every class starts with gg-,
 * so the Melting Moments pages are never touched. The shared nav and footer
 * read the pathname to switch to their Guido's versions.
 */

// The browser chrome matches the slim cream bar at the top of the page
export const viewport: Viewport = {
  themeColor: '#EDE4CE',
};

export default function GuidosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gg" style={{ paddingTop: 'var(--nav-height)', minHeight: '60vh' }}>
      <GuidosBar />
      {/* Where "Skip to main content" lands on these pages, past the Guido's bar */}
      <div id="gg-content" tabIndex={-1}>{children}</div>
    </div>
  );
}
