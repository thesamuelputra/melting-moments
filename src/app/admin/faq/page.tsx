import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminFaqClient from './AdminFaqClient';

// These are the EXACT same fallbacks used on the public /faq page.
// If no FAQs are in Convex yet, the admin shows these so you can
// edit/delete them — any save will persist them to Convex.
const STATIC_FAQS = [
  { id: 'static-0', question: 'How far in advance should I book?', answer: 'For weddings, we recommend booking 9-12 months in advance. For corporate and private events, 2-3 months is preferred, though we can sometimes accommodate shorter notices.', orderIndex: 0, isActive: true },
  { id: 'static-1', question: 'Do you provide tastings?', answer: 'Yes. Once an initial proposal is approved, we schedule a private tasting with Chef Paul to finalize the menu.', orderIndex: 1, isActive: true },
  { id: 'static-2', question: 'Are staff and rentals included?', answer: 'Our proposals are comprehensive and customized. We can include professional waitstaff, bartenders, and coordinate all necessary rentals (linens, glassware, plates) based on your needs.', orderIndex: 2, isActive: true },
  { id: 'static-3', question: 'Do you accommodate dietary restrictions?', answer: 'Absolutely. We are highly experienced in creating exceptional vegan, gluten-free, and allergy-safe menus that meet our award-winning standards.', orderIndex: 3, isActive: true },
];

export default async function AdminFaqPage() {
  const rawFaqs = await fetchQuery(api.faqs.list);

  const faqs = rawFaqs.length > 0
    ? rawFaqs.map(f => ({
        id: f._id,
        question: f.question,
        answer: f.answer,
        orderIndex: f.orderIndex,
        isActive: f.isActive,
      }))
    : STATIC_FAQS;

  const isSeeded = rawFaqs.length > 0;

  return <AdminFaqClient initialFaqs={faqs} isSeeded={isSeeded} />;
}
