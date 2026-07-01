'use server';

import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { revalidatePath, updateTag } from 'next/cache';
import { Id } from '@/../convex/_generated/dataModel';
import { requireAdmin } from '@/lib/auth';

export async function createFaq(question: string, answer: string, orderIndex: number) {
  await requireAdmin();
  try {
    const id = await fetchMutation(api.faqs.create, { adminSecret: process.env.ADMIN_PASSWORD!, question, answer, orderIndex });
    await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: 'Added FAQ', section: 'FAQ', details: question });
    updateTag('cms');
    revalidatePath('/', 'layout');
    revalidatePath('/faq');
    return { success: true as const, id: id as string };
  } catch { return { success: false as const }; }
}

export async function updateFaq(id: string, fields: { question?: string; answer?: string; orderIndex?: number; isActive?: boolean }) {
  await requireAdmin();
  try {
    await fetchMutation(api.faqs.update, { adminSecret: process.env.ADMIN_PASSWORD!, id: id as Id<'faqs'>, ...fields });
    await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: 'Updated FAQ', section: 'FAQ', details: fields.question });
    updateTag('cms');
    revalidatePath('/', 'layout');
    revalidatePath('/faq');
    return { success: true };
  } catch { return { success: false }; }
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  try {
    await fetchMutation(api.faqs.remove, { adminSecret: process.env.ADMIN_PASSWORD!, id: id as Id<'faqs'> });
    await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: 'Deleted FAQ', section: 'FAQ' });
    updateTag('cms');
    revalidatePath('/', 'layout');
    revalidatePath('/faq');
    return { success: true };
  } catch { return { success: false }; }
}
