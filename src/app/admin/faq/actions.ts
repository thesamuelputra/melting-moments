'use server';

import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { revalidatePath } from 'next/cache';
import { Id } from '@/../convex/_generated/dataModel';
import { requireAdmin } from '@/lib/auth';

export async function createFaq(question: string, answer: string, orderIndex: number) {
  await requireAdmin();
  try {
    await fetchMutation(api.faqs.create, { question, answer, orderIndex });
    await fetchMutation(api.activityLog.log, { action: 'Added FAQ', section: 'FAQ', details: question });
    revalidatePath('/faq');
    return { success: true };
  } catch { return { success: false }; }
}

export async function updateFaq(id: string, fields: { question?: string; answer?: string; orderIndex?: number; isActive?: boolean }) {
  await requireAdmin();
  try {
    await fetchMutation(api.faqs.update, { id: id as Id<'faqs'>, ...fields });
    await fetchMutation(api.activityLog.log, { action: 'Updated FAQ', section: 'FAQ', details: fields.question });
    revalidatePath('/faq');
    return { success: true };
  } catch { return { success: false }; }
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  try {
    await fetchMutation(api.faqs.remove, { id: id as Id<'faqs'> });
    await fetchMutation(api.activityLog.log, { action: 'Deleted FAQ', section: 'FAQ' });
    revalidatePath('/faq');
    return { success: true };
  } catch { return { success: false }; }
}
