'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

type NavLink = { href: string; label: string; icon: React.ReactNode; liveTag?: boolean };
type NavDivider = { divider: string };
type NavItem = NavLink | NavDivider;

// Breadcrumb config — maps pathname prefixes to human-readable label chains
const BREADCRUMBS: Array<{ match: (p: string) => boolean; crumbs: Array<{ label: string; href?: string }> }> = [
  { match: p => p === '/admin', crumbs: [{ label: 'Dashboard' }] },
  { match: p => p.startsWith('/admin/inquiries'), crumbs: [{ label: 'Dashboard', href: '/admin' }, { label: 'Inquiries' }] },
  { match: p => p.startsWith('/admin/banner'), crumbs: [{ label: 'Dashboard', href: '/admin' }, { label: 'Content', href: undefined }, { label: 'Banner' }] },
  { match: p => p.startsWith('/admin/content'), crumbs: [{ label: 'Dashboard', href: '/admin' }, { label: 'Content', href: undefined }, { label: 'Site Content' }] },
  { match: p => p.startsWith('/admin/menus'), crumbs: [{ label: 'Dashboard', href: '/admin' }, { label: 'Content', href: undefined }, { label: 'Menu Editor' }] },
  { match: p => p.startsWith('/admin/faq'), crumbs: [{ label: 'Dashboard', href: '/admin' }, { label: 'Content', href: undefined }, { label: 'FAQ' }] },
  { match: p => p.startsWith('/admin/testimonials'), crumbs: [{ label: 'Dashboard', href: '/admin' }, { label: 'Content', href: undefined }, { label: 'Testimonials' }] },
  { match: p => p.startsWith('/admin/guidos-products'), crumbs: [{ label: 'Dashboard', href: '/admin' }, { label: "Guido's Gourmet", href: undefined }, { label: 'Products' }] },
  { match: p => p.startsWith('/admin/guidos-orders'), crumbs: [{ label: 'Dashboard', href: '/admin' }, { label: "Guido's Gourmet", href: undefined }, { label: 'Orders' }] },
  { match: p => p.startsWith('/admin/settings'), crumbs: [{ label: 'Dashboard', href: '/admin' }, { label: 'System', href: undefined }, { label: 'Settings' }] },
];

function getBreadcrumbs(pathname: string) {
  return BREADCRUMBS.find(b => b.match(pathname))?.crumbs ?? [{ label: 'Dashboard' }];
}

function buildNavItems(bannerEnabled: boolean): NavItem[] {
  return [
    { href: '/admin', label: 'Dashboard', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )},
    { href: '/admin/inquiries', label: 'Inquiries', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    )},
    { divider: 'Content' },
    { href: '/admin/banner', label: 'Banner', liveTag: bannerEnabled, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M22 17H2a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h20a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3z" />
        <path d="M12 12h.01" />
      </svg>
    )},
    { href: '/admin/content', label: 'Site Content', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    )},
    { href: '/admin/menus', label: 'Menu Editor', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )},
    { href: '/admin/faq', label: 'FAQ', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )},
    { href: '/admin/testimonials', label: 'Testimonials', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )},
    { divider: "Guido's Gourmet" },
    { href: '/admin/guidos-products', label: 'Products', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    )},
    { href: '/admin/guidos-orders', label: 'Orders', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    )},
    { divider: 'System' },
    { href: '/admin/settings', label: 'Settings', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )},
  ];
}

// Shared dirty-state registry — forms can register/unregister themselves
// so the layout can intercept navigation if there are unsaved changes.
type DirtyListener = () => boolean;
const _listeners = new Set<DirtyListener>();
export function registerDirtyListener(fn: DirtyListener) { _listeners.add(fn); return () => _listeners.delete(fn); }
export function isAnyFormDirty() { return [..._listeners].some(fn => fn()); }

export default function AdminLayoutClient({ children, bannerEnabled }: { children: React.ReactNode; bannerEnabled: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [navConfirm, setNavConfirm] = useState<{ href: string } | null>(null);
  const navItems = buildNavItems(bannerEnabled);
  const breadcrumbs = getBreadcrumbs(pathname);

  useEffect(() => { setIsSidebarOpen(false); }, [pathname]);

  const handleNavClick = useCallback((href: string, e: React.MouseEvent) => {
    if (href === pathname) return;
    if (isAnyFormDirty()) {
      e.preventDefault();
      setNavConfirm({ href });
    }
  }, [pathname]);

  return (
    <div className="admin-layout">
      {/* Dirty-nav confirmation modal */}
      {navConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '2rem', maxWidth: '380px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.75rem' }}>Unsaved Changes</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              You have unsaved changes on this page. If you leave now, your edits will be lost.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="admin-btn" onClick={() => setNavConfirm(null)}>Stay</button>
              <button
                className="admin-btn"
                style={{ background: '#111', color: 'white', borderColor: '#111' }}
                onClick={() => { setNavConfirm(null); router.push(navConfirm.href); }}
              >
                Leave anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      <div className={`admin-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar__brand">
          <h2>Melting Moments</h2>
          <span>Admin Console</span>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item, i) => {
            if ('divider' in item) {
              return (
                <div key={`divider-${i}`} style={{ padding: '1rem 1rem 0.4rem 1rem', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginTop: i > 0 ? '0.5rem' : 0 }}>
                  {item.divider}
                </div>
              );
            }
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}
                onClick={(e) => handleNavClick(item.href, e)}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.liveTag && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(16,185,129,0.2)', color: '#6EE7B7', padding: '0.15rem 0.4rem', borderRadius: '20px', fontWeight: 600 }}>
                    <span style={{ width: '5px', height: '5px', background: '#34D399', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    Live
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <Link href="/" target="_blank" rel="noopener noreferrer">View Live Site →</Link>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button className="admin-topbar__hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle Menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {idx > 0 && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      onClick={(e) => handleNavClick(crumb.href!, e)}
                      style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.35)', textDecoration: 'none', fontWeight: 400 }}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: idx === breadcrumbs.length - 1 ? 'var(--clr-ink)' : 'rgba(0,0,0,0.35)', fontWeight: idx === breadcrumbs.length - 1 ? 500 : 400 }}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          </div>
          <div className="admin-topbar__actions" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', alignSelf: 'center' }}>Chef Paul Silletta</span>
            <form action={async () => {
              const { logout } = await import('@/app/admin-login/actions');
              await logout();
            }}>
              <button type="submit" style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#EF4444', cursor: 'pointer', marginLeft: '1rem', fontWeight: 500 }}>Logout</button>
            </form>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
