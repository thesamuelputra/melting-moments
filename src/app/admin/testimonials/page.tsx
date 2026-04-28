import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminTestimonialsClient from './AdminTestimonialsClient';

// These are the EXACT same fallbacks used on the public /testimonials page.
const STATIC_TESTIMONIALS = [
  { id: 'static-0', author: 'Sarah & James', role: 'Wedding Clients', text: 'Melting Moments transformed our wedding. The food was not just catering; it was an experience. Guests are still talking about the duck confit.', rating: 5, orderIndex: 0, isActive: true },
  { id: 'static-1', author: 'Victoria Tech Group', role: 'Corporate Client', text: 'Chef Paul handled our 300-person corporate gala flawlessly. The execution was punctual, the staff invisible yet attentive, and the flavor profiles were exceptional.', rating: 5, orderIndex: 1, isActive: true },
  { id: 'static-2', author: 'Elena M.', role: 'Private Event Client', text: 'The chocolate fountain was the centerpiece of our anniversary. Professional setup, premium ingredients, unparalleled service.', rating: 5, orderIndex: 2, isActive: true },
];

export default async function AdminTestimonialsPage() {
  const raw = await fetchQuery(api.testimonials.list);

  const testimonials = raw.length > 0
    ? raw.map(t => ({
        id: t._id,
        author: t.author,
        role: t.role,
        text: t.text,
        rating: t.rating,
        orderIndex: t.orderIndex,
        isActive: t.isActive,
      }))
    : STATIC_TESTIMONIALS;

  const isSeeded = raw.length > 0;

  return <AdminTestimonialsClient initialTestimonials={testimonials} isSeeded={isSeeded} />;
}
