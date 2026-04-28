'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type NavLink = { href: string; label: string; icon: React.ReactNode; liveTag?: boolean };
type NavDivider = { divider: string };
type NavItem = NavLink | NavDivider;

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
    { divider: 'System' },
    { href: '/admin/settings', label: 'Settings', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )},
  ];
}

export default function AdminLayoutClient({ children, bannerEnabled }: { children: React.ReactNode; bannerEnabled: boolean }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navItems = buildNavItems(bannerEnabled);

  useEffect(() => { setIsSidebarOpen(false); }, [pathname]);

  const activeLabel = navItems
    .filter((i): i is NavLink => 'href' in i)
    .find(i => pathname === i.href || (i.href !== '/admin' && pathname.startsWith(i.href)))
    ?.label || 'Dashboard';

  return (
    <div className="admin-layout">
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
              <Link key={item.href} href={item.href} className={`admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
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
            <div className="admin-topbar__title">{activeLabel}</div>
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
