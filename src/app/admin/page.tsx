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

function formatAbsolute(ts: number): string {
  return new Date(ts).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const SECTION_DOT: Record<string, string> = {
  'Banner': '#D97706',
  'Site Content': '#3B82F6',
  'FAQ': '#8B5CF6',
  'Testimonials': '#EC4899',
  'Menu': '#059669',
  "Guido's Products": '#B45309',
  "Guido's Orders": '#DC2626',
  'Inquiries': '#0EA5E9',
  'Settings': '#6B7280',
  'Activity': '#9CA3AF',
};

const ARCHIVED_BADGE_STYLE = { background: '#F3F4F6', color: '#6B7280' };

export default async function AdminDashboard() {
  const adminSecret = process.env.ADMIN_PASSWORD!;
  const [
    inquiryCounts,
    recentInquiries,
    totalMenuItems,
    categoryCount,
    faqs,
    testimonials,
    recentActivity,
    settings,
    guidosProductCount,
    guidosOrderCounts,
  ] = await Promise.all([
    fetchQuery(api.inquiries.counts, { adminSecret }),
    fetchQuery(api.inquiries.recent, { adminSecret, limit: 8 }),
    fetchQuery(api.menuItems.count),
    fetchQuery(api.menuItems.categoryCount),
    fetchQuery(api.faqs.list, { adminSecret }),
    fetchQuery(api.testimonials.list, { adminSecret }),
    fetchQuery(api.activityLog.recent, { adminSecret, limit: 8 }),
    fetchQuery(api.businessSettings.getAll),
    fetchQuery(api.guidosProducts.count),
    fetchQuery(api.guidosOrders.counts, { adminSecret }),
  ]);

  const bannerEnabled = settings['banner_enabled'] === 'true';

  return (
    <div>
      {/* Banner Status Alert */}
      {bannerEnabled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97706', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>Announcement Banner is LIVE</strong> &middot; &ldquo;{settings['banner_text']}&rdquo;
          </div>
          <Link href="/admin/banner" className="admin-btn admin-btn--sm">Manage</Link>
        </div>
      )}

      {/* KPI Cards. Captions are static context, styled neutral on purpose
          (the --up/--down trend colors are reserved for real computed deltas). */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">Pending Inquiries</div>
          <div className="admin-kpi-card__value">{inquiryCounts.new}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--neutral">Awaiting first contact</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">Active Inquiries</div>
          <div className="admin-kpi-card__value">{inquiryCounts.active}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--neutral">Excludes archived</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">Booked Events</div>
          <div className="admin-kpi-card__value">{inquiryCounts.booked}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--neutral">Confirmed bookings</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">Menu Items</div>
          <div className="admin-kpi-card__value">{totalMenuItems}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--neutral">Across {categoryCount} categories</div>
        </div>
      </div>

      {/* Guido's KPI Cards */}
      <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginTop: '1rem' }}>Guido&apos;s Gourmet</div>
      <div className="admin-kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">New Orders</div>
          <div className="admin-kpi-card__value">{guidosOrderCounts.received}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--neutral">Awaiting confirmation</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">Active Orders</div>
          <div className="admin-kpi-card__value">{guidosOrderCounts.active}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--neutral">In progress</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">Total Orders</div>
          <div className="admin-kpi-card__value">{guidosOrderCounts.total}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--neutral">All time</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__label">Products</div>
          <div className="admin-kpi-card__value">{guidosProductCount}</div>
          <div className="admin-kpi-card__trend admin-kpi-card__trend--neutral">In catalog</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        {[
          { href: '/admin/banner', label: 'Announcement', sub: bannerEnabled ? 'Banner live' : 'Banner off', dotColor: bannerEnabled ? '#059669' : 'rgba(0,0,0,0.15)' },
          { href: '/admin/content', label: 'Site Content', sub: 'Headers & descriptions' },
          { href: '/admin/menus', label: 'Menu Editor', sub: `${totalMenuItems} items` },
          { href: '/admin/faq', label: 'FAQ', sub: `${faqs.length} questions` },
          { href: '/admin/testimonials', label: 'Testimonials', sub: `${testimonials.length} reviews` },
          { href: '/admin/inquiries', label: 'Inquiries', sub: `${inquiryCounts.new} new` },
          { href: '/admin/guidos-products', label: 'Guido\'s Products', sub: `${guidosProductCount} items` },
          { href: '/admin/guidos-orders', label: 'Guido\'s Orders', sub: `${guidosOrderCounts.received} new` },
          { href: '/admin/settings', label: 'Settings', sub: 'Business info' },
        ].map(({ href, label, sub, dotColor }) => (
          <Link
            key={href}
            href={href}
            className="admin-quick-action"
          >
            {dotColor && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.35)', marginTop: '0.1rem' }}>{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column: Inquiries + Activity Feed */}
      <div className="admin-dashboard-cols" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Recent Inquiries */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Recent Inquiries</h3>
            <Link href="/admin/inquiries" className="admin-btn admin-btn--sm">View All</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-charcoal)' }}>
                      No inquiries yet.
                    </td>
                  </tr>
                )}
                {recentInquiries.map((inq) => (
                  <tr key={inq._id}>
                    <td>
                      <div className="admin-table__name">{inq.name}</div>
                      <div className="admin-table__email">{inq.email}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span style={{ fontWeight: 500 }}>{inq.eventType}</span>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.1rem' }}>{inq.guestCount} guests</div>
                    </td>
                    <td>{inq.date ? new Date(inq.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</td>
                    <td style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }} title={formatAbsolute(inq.submittedAt)}>
                      {formatRelativeTime(inq.submittedAt)}
                    </td>
                    <td>
                      <span
                        className={`admin-badge admin-badge--${inq.status}`}
                        style={inq.status === 'archived' ? ARCHIVED_BADGE_STYLE : undefined}
                      >
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
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: SECTION_DOT[entry.section] || '#9CA3AF', flexShrink: 0, marginTop: '0.4rem' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--clr-ink)' }}>{entry.action}</div>
                  {entry.details && (
                    <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.details}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.3)', flexShrink: 0, paddingTop: '0.15rem' }} title={formatAbsolute(entry.performedAt)}>
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
