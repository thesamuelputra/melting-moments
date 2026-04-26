'use server';

import { revalidatePath } from 'next/cache';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';

export async function updateInquiryStatus(id: string, status: string) {
  if (!id) return { success: false, error: 'ID is required' };
  const validStatuses = ['new', 'contacted', 'booked', 'declined', 'archived'];
  if (!validStatuses.includes(status)) return { success: false, error: 'Invalid status' };

  try {
    await fetchMutation(api.inquiries.updateStatus, {
      id: id as Id<"inquiries">,
      status,
    });
    revalidatePath('/admin/inquiries');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to update inquiry status:', error);
    return { success: false, error: 'Failed to update inquiry status' };
  }
}

export async function deleteInquiry(id: string) {
  if (!id) return { success: false, error: 'ID is required' };

  try {
    await fetchMutation(api.inquiries.remove, {
      id: id as Id<"inquiries">,
    });
    revalidatePath('/admin/inquiries');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete inquiry:', error);
    return { success: false, error: 'Failed to delete inquiry' };
  }
}
