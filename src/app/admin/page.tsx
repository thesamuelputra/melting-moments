import Link from 'next/link';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const SECTION_ICONS: Record<string, string> = {
  'Banner': '📣',
  'Site Content': '✏️',
  'FAQ': '❓',
  'Testimonials': '⭐',
  'Menu': '📋',
  'Settings': '⚙️',
};

export default async function AdminDashboard() {
  const [allInquiries, totalMenuItems, categoryCount, faqCount, testimonialCount, recentActivity, settings] = await Promise.all([
    fetchQuery(api.inquiries.list),
    fetchQuery(api.menuItems.count),
    fetchQuery(api.menuItems.categoryCount),
    fetchQuery(api.faqs.list),
    fetchQuery(api.testimonials.list),
    fetchQuery(api.activityLog.recent, { limit: 8 }),
    fetchQuery(api.businessSettings.getAll),
  ]);

  const nonArchived = allInquiries.filter((i) => i.status !== 'archived');
  const inquiries = nonArchived.slice(0, 8);
  const totalInquiries = nonArchived.length;
  const newInquiriesCount = allInquiries.filter((i) => i.status === 'new').length;
  const bookedCount = allInquiries.filter((i) => i.status === 'booked').length;
  const bannerEnabled = settings['banner_enabled'] === 'true';

  return (
    <div>
      {/* Banner Status Alert */}
      {bannerEnabled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
          <span>📣</span>
          <div style={{ flex: 1 }}>
            <strong>Announcement Banner is LIVE</strong> — "{settings['banner_text']}"
          </div>
          <Link href="/admin/banner" className="admin-btn admin-btn--sm">Manage</Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">Pending Inquiries</div>
          <div className="admin-kpi-card__value">{newInquiriesCount}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--up">New leads to review</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">Total Inquiries</div>
          <div className="admin-kpi-card__value">{totalInquiries}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--neutral">All time submissions</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">Booked Events</div>
          <div className="admin-kpi-card__value">{bookedCount}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--up">Confirmed bookings</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">Menu Items</div>
          <div className="admin-kpi-card__value">{totalMenuItems}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--neutral">Across {categoryCount} categories</div>
        </div>
      </div>

      {/* Quick Actions — full control center grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        {[
          { href: '/admin/banner', icon: '📣', label: 'Announcement', sub: bannerEnabled ? '🟢 Banner live' : '⚪ Banner off' },
          { href: '/admin/content', icon: '✏️', label: 'Site Content', sub: 'Headers & descriptions' },
          { href: '/admin/menus', icon: '📋', label: 'Menu Editor', sub: `${totalMenuItems} items` },
          { href: '/admin/faq', icon: '❓', label: 'FAQ', sub: `${faqCount.length} questions` },
          { href: '/admin/testimonials', icon: '⭐', label: 'Testimonials', sub: `${testimonialCount.length} reviews` },
          { href: '/admin/inquiries', icon: '📩', label: 'Inquiries', sub: `${newInquiriesCount} new` },
          { href: '/admin/settings', icon: '⚙️', label: 'Settings', sub: 'Business info' },
        ].map(({ href, icon, label, sub }) => (
          <Link
            key={href}
            href={href}
            className="admin-quick-action"
          >
            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.35)', marginTop: '0.1rem' }}>{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column: Inquiries + Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Recent Inquiries */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Recent Inquiries</h3>
            <Link href="/admin/inquiries" className="admin-btn admin-btn--sm">View All</Link>
          </div>
          <div className="admin-table-overflow">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-charcoal)' }}>
                      No inquiries yet.
                    </td>
                  </tr>
                )}
                {inquiries.map((inq) => (
                  <tr key={inq._id}>
                    <td>
                      <div className="admin-table__name">{inq.name}</div>
                      <div className="admin-table__email">{inq.email}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span style={{ fontWeight: 500 }}>{inq.eventType}</span>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.1rem' }}>{inq.guestCount} guests</div>
                    </td>
                    <td>{inq.date ? new Date(inq.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${inq.status}`}>
                        <span className="admin-badge__dot" />
                        {inq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Activity Log</h3>
          </div>
          <div style={{ padding: '0.75rem' }}>
            {recentActivity.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(0,0,0,0.3)', fontSize: '0.8rem' }}>
                No recent activity. Changes you make appear here.
              </div>
            )}
            {recentActivity.map((entry) => (
              <div key={entry._id} className="admin-activity-entry">
                <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '0.1rem' }}>
                  {SECTION_ICONS[entry.section] || '📝'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--clr-ink)' }}>{entry.action}</div>
                  {entry.details && (
                    <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.details}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.3)', flexShrink: 0, paddingTop: '0.15rem' }}>
                  {formatRelativeTime(entry.performedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
