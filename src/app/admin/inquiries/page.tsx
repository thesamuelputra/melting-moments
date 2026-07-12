import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { ToastProvider } from '../_components';
import AdminInquiriesClient, { type Inquiry } from './AdminInquiriesClient';

// Kept local: importing a const from the 'use client' module would turn it
// into an opaque client reference in this server component.
const INQUIRY_STATUSES = ['new', 'contacted', 'booked', 'declined', 'archived'] as const;

function toStatus(value: string): Inquiry['status'] {
  return (INQUIRY_STATUSES as readonly string[]).includes(value)
    ? (value as Inquiry['status'])
    : 'new';
}

export default async function InquiriesPage() {
  const rawInquiries = await fetchQuery(api.inquiries.list, {
    adminSecret: process.env.ADMIN_PASSWORD!,
  });

  // Serialize for the client component
  const inquiries: Inquiry[] = rawInquiries.map((inq) => ({
    id: inq._id,
    name: inq.name,
    email: inq.email,
    phone: inq.phone,
    eventType: inq.eventType,
    guestCount: inq.guestCount,
    date: inq.date,
    venue: inq.venue,
    status: toStatus(inq.status),
    notes: inq.notes,
    adminNotes: inq.adminNotes ?? '',
    archivedFromStatus: inq.archivedFromStatus ?? null,
    submittedAt: new Date(inq.submittedAt).toISOString(),
  }));

  return (
    <ToastProvider>
      <AdminInquiriesClient initialInquiries={inquiries} />
    </ToastProvider>
  );
}
