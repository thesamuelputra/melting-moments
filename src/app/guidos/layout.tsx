import type { Viewport } from 'next';

/**
 * Scopes what Guido's Gourmet does differently to the /guidos subtree: the
 * green buttons, blocks and footer hang off the .brand-guidos class, so the
 * Melting Moments pages are never touched. The paper and the type are the
 * site's own. The shared nav and footer read the pathname to match while a
 * visitor is inside the section.
 */

// Override the global dark theme-color so mobile browser chrome matches the
// deep green of the Guido's blocks instead of the Melting Moments near-black.
export const viewport: Viewport = {
  themeColor: '#123F2E',
};

export default function GuidosLayout({ children }: { children: React.ReactNode }) {
  return <div className="brand-guidos" style={{ minHeight: '60vh' }}>{children}</div>;
}
