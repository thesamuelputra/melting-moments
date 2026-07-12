import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminFaqClient, { type Faq } from './AdminFaqClient';

export default async function AdminFaqPage() {
  // null = Convex unreachable (client renders a "CMS unreachable" state
  // instead of crashing to the error boundary). An empty array means the
  // CMS genuinely has no FAQs yet — the client offers the starter import.
  let faqs: Faq[] | null;
  try {
    const raw = await fetchQuery(api.faqs.list, {
      adminSecret: process.env.ADMIN_PASSWORD!,
    });
    faqs = raw.map((f) => ({
      id: f._id,
      question: f.question,
      answer: f.answer,
      category: f.category,
      isActive: f.isActive,
    }));
  } catch {
    faqs = null;
  }

  return <AdminFaqClient initialFaqs={faqs} />;
}
