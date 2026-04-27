import Link from 'next/link';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';

export default async function AdminDashboard() {
  const [allInquiries, totalMenuItems, categoryCount] = await Promise.all([
    fetchQuery(api.inquiries.list),
    fetchQuery(api.menuItems.count),
    fetchQuery(api.menuItems.categoryCount),
  ]);

  // Derive counts from the full list
  const nonArchived = allInquiries.filter((i) => i.status !== 'archived');
  const inquiries = nonArchived.slice(0, 10); // recent 10
  const totalInquiries = nonArchived.length;
  const newInquiriesCount = allInquiries.filter((i) => i.status === 'new').length;
  const bookedCount = allInquiries.filter((i) => i.status === 'booked').length;

  return (
    <div>
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

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', textDecoration: 'none', color: 'var(--clr-ink)', transition: 'box-shadow 0.2s' }}>
          <span style={{ fontSize: '1.25rem' }}>✏️</span>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Edit Site Content</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.35)' }}>Headers, descriptions, text</div>
          </div>
        </Link>
        <Link href="/admin/menus" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', textDecoration: 'none', color: 'var(--clr-ink)', transition: 'box-shadow 0.2s' }}>
          <span style={{ fontSize: '1.25rem' }}>📋</span>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Manage Menus</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.35)' }}>Add, edit, or hide menu items</div>
          </div>
        </Link>
        <Link href="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', textDecoration: 'none', color: 'var(--clr-ink)', transition: 'box-shadow 0.2s' }}>
          <span style={{ fontSize: '1.25rem' }}>⚙️</span>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Settings</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.35)' }}>Business info & notifications</div>
          </div>
        </Link>
      </div>

      {/* Recent Inquiries List */}
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
                    No inquiries yet. They will appear here when submitted via the contact form.
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
                    <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.1rem' }}>
                      {inq.guestCount} guests
                    </div>
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
    </div>
  );
}
