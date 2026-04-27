import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminFaqClient from './AdminFaqClient';

export default async function AdminFaqPage() {
  const rawFaqs = await fetchQuery(api.faqs.list);
  const faqs = rawFaqs.map(f => ({
    id: f._id,
    question: f.question,
    answer: f.answer,
    orderIndex: f.orderIndex,
    isActive: f.isActive,
  }));
  return <AdminFaqClient initialFaqs={faqs} />;
}
