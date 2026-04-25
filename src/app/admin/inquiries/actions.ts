'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

export async function updateInquiryStatus(id: string, status: string) {
  if (!id) return { success: false, error: 'ID is required' };
  const validStatuses = ['new', 'contacted', 'booked', 'declined', 'archived'];
  if (!validStatuses.includes(status)) return { success: false, error: 'Invalid status' };

  try {
    await db.inquiry.update({
      where: { id },
      data: { status }
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
    await db.inquiry.delete({ where: { id } });
    revalidatePath('/admin/inquiries');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete inquiry:', error);
    return { success: false, error: 'Failed to delete inquiry' };
  }
}
