import type { Viewport } from 'next';

/**
 * Scopes the Guido's Gourmet identity to the /guidos subtree. Everything the
 * sub-brand restyles hangs off the .brand-guidos class, so the Melting Moments
 * pages are never touched. The shared nav and footer read the pathname to
 * match this skin while a visitor is inside the section.
 */

// Override the global dark theme-color so mobile browser chrome matches the
// cream/green Guido's palette instead of the Melting Moments near-black.
export const viewport: Viewport = {
  themeColor: '#123F2E',
};

export default function GuidosLayout({ children }: { children: React.ReactNode }) {
  return <div className="brand-guidos g-paper" style={{ minHeight: '60vh' }}>{children}</div>;
}
