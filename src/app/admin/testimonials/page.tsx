import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminTestimonialsClient, { type Testimonial } from './AdminTestimonialsClient';

export default async function AdminTestimonialsPage() {
  // null = Convex unreachable (client renders a "CMS unreachable" state
  // instead of crashing to the error boundary). An empty array is the real
  // empty state — there are NO fallback testimonials anywhere: the public
  // page shows a "get in touch" invitation until real quotes are added.
  let testimonials: Testimonial[] | null;
  try {
    const raw = await fetchQuery(api.testimonials.list, {
      adminSecret: process.env.ADMIN_PASSWORD!,
    });
    testimonials = raw.map((t) => ({
      id: t._id,
      author: t.author,
      role: t.role,
      text: t.text,
      rating: t.rating,
      // Schema stores brand as a plain string (legacy rows) — narrow to the
      // enum the client understands; anything else means "both".
      brand: t.brand === 'catering' || t.brand === 'guidos' ? t.brand : undefined,
      isActive: t.isActive,
    }));
  } catch {
    testimonials = null;
  }

  return <AdminTestimonialsClient initialTestimonials={testimonials} />;
}
