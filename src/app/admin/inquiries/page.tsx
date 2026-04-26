import db from '@/lib/db';
import AdminInquiriesClient from './AdminInquiriesClient';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
  const inquiries = await db.inquiry.findMany({
    orderBy: {
      submittedAt: 'desc'
    }
  });

  return <AdminInquiriesClient initialInquiries={inquiries} />;
}
