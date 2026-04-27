import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminTestimonialsClient from './AdminTestimonialsClient';

export default async function AdminTestimonialsPage() {
  const raw = await fetchQuery(api.testimonials.list);
  const testimonials = raw.map(t => ({
    id: t._id,
    author: t.author,
    role: t.role,
    text: t.text,
    rating: t.rating,
    orderIndex: t.orderIndex,
    isActive: t.isActive,
  }));
  return <AdminTestimonialsClient initialTestimonials={testimonials} />;
}
