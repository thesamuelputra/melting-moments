import db from '@/lib/db';
import Link from 'next/link';

export const revalidate = 0; // Ensure fresh data on load

export default async function AdminDashboard() {
  const [inquiries, totalMenuItems, totalInquiries, bookedCount] = await Promise.all([
    db.inquiry.findMany({
      where: { status: { not: 'archived' } },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    }),
    db.menuItem.count(),
    db.inquiry.count({ where: { status: { not: 'archived' } } }),
    db.inquiry.count({ where: { status: 'booked' } }),
  ]);

  const newInquiriesCount = await db.inquiry.count({
    where: { status: 'new' }
  });

  // Calculate unique categories count
  const categoriesDb = await db.menuItem.groupBy({
    by: ['category']
  });
  const categoryCount = categoriesDb.length;

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
                <tr key={inq.id}>
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
