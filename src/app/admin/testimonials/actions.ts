'use server';

import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { revalidatePath } from 'next/cache';
import { Id } from '@/../convex/_generated/dataModel';

export async function createTestimonial(data: { author: string; role?: string; text: string; rating?: number; orderIndex: number }) {
  try {
    await fetchMutation(api.testimonials.create, data);
    await fetchMutation(api.activityLog.log, { action: 'Added testimonial', section: 'Testimonials', details: `From ${data.author}` });
    revalidatePath('/testimonials');
    return { success: true };
  } catch { return { success: false }; }
}

export async function updateTestimonial(id: string, fields: { author?: string; role?: string; text?: string; rating?: number; orderIndex?: number; isActive?: boolean }) {
  try {
    await fetchMutation(api.testimonials.update, { id: id as Id<'testimonials'>, ...fields });
    await fetchMutation(api.activityLog.log, { action: 'Updated testimonial', section: 'Testimonials', details: fields.author });
    revalidatePath('/testimonials');
    return { success: true };
  } catch { return { success: false }; }
}

export async function deleteTestimonial(id: string) {
  try {
    await fetchMutation(api.testimonials.remove, { id: id as Id<'testimonials'> });
    await fetchMutation(api.activityLog.log, { action: 'Deleted testimonial', section: 'Testimonials' });
    revalidatePath('/testimonials');
    return { success: true };
  } catch { return { success: false }; }
}
