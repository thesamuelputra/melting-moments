import db from '@/lib/db';
import AdminInquiriesClient from './AdminInquiriesClient';

export const revalidate = 0; // Ensure fresh data on load

export default async function InquiriesPage() {
  const inquiries = await db.inquiry.findMany({
    orderBy: {
      submittedAt: 'desc'
    }
  });

  return <AdminInquiriesClient initialInquiries={inquiries} />;
}
