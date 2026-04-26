import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminInquiriesClient from './AdminInquiriesClient';

export default async function InquiriesPage() {
  const rawInquiries = await fetchQuery(api.inquiries.list);

  // Serialize for client component
  const inquiries = rawInquiries.map((inq) => ({
    id: inq._id,
    name: inq.name,
    email: inq.email,
    phone: inq.phone,
    eventType: inq.eventType,
    guestCount: inq.guestCount,
    date: inq.date,
    venue: inq.venue,
    status: inq.status,
    notes: inq.notes,
    submittedAt: new Date(inq.submittedAt).toISOString(),
  }));

  return <AdminInquiriesClient initialInquiries={inquiries} />;
}
