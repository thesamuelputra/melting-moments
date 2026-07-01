'use server';

import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { revalidatePath, updateTag } from 'next/cache';
import { Id } from '@/../convex/_generated/dataModel';
import { requireAdmin } from '@/lib/auth';

export async function createTestimonial(data: { author: string; role?: string; text: string; rating?: number; orderIndex: number }) {
  await requireAdmin();
  try {
    await fetchMutation(api.testimonials.create, { adminSecret: process.env.ADMIN_PASSWORD!, ...data });
    await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: 'Added testimonial', section: 'Testimonials', details: `From ${data.author}` });
    updateTag('cms');
    revalidatePath('/', 'layout');
    revalidatePath('/testimonials');
    return { success: true };
  } catch { return { success: false }; }
}

export async function updateTestimonial(id: string, fields: { author?: string; role?: string; text?: string; rating?: number; orderIndex?: number; isActive?: boolean }) {
  await requireAdmin();
  try {
    await fetchMutation(api.testimonials.update, { adminSecret: process.env.ADMIN_PASSWORD!, id: id as Id<'testimonials'>, ...fields });
    await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: 'Updated testimonial', section: 'Testimonials', details: fields.author });
    updateTag('cms');
    revalidatePath('/', 'layout');
    revalidatePath('/testimonials');
    return { success: true };
  } catch { return { success: false }; }
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  try {
    await fetchMutation(api.testimonials.remove, { adminSecret: process.env.ADMIN_PASSWORD!, id: id as Id<'testimonials'> });
    await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: 'Deleted testimonial', section: 'Testimonials' });
    updateTag('cms');
    revalidatePath('/', 'layout');
    revalidatePath('/testimonials');
    return { success: true };
  } catch { return { success: false }; }
}
