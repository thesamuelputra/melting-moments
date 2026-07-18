/**
 * Scopes the Guido's Gourmet identity to the /guidos subtree. Everything the
 * sub-brand restyles hangs off the .brand-guidos class, so the Melting Moments
 * pages are never touched. The shared nav and footer read the pathname to
 * match this skin while a visitor is inside the section.
 */
export default function GuidosLayout({ children }: { children: React.ReactNode }) {
  return <div className="brand-guidos g-paper" style={{ minHeight: '60vh' }}>{children}</div>;
}
