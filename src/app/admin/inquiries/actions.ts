'use server';

import { revalidatePath } from 'next/cache';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { requireAdmin, AdminAuthError } from '@/lib/auth';

const INQUIRY_STATUSES = ['new', 'contacted', 'booked', 'declined', 'archived'] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: 'unauthorized' | 'invalid' | 'failed'; message?: string };

export type RestoreResult =
  | { success: true; restoredStatus: InquiryStatus }
  | { success: false; error: 'unauthorized' | 'invalid' | 'failed'; message?: string };

/**
 * Inquiries hold no public-facing content, so mutations here only refresh the
 * admin surfaces (no updateTag('cms') / public-path revalidation needed).
 */
function revalidateInquiryViews() {
  revalidatePath('/admin/inquiries');
  revalidatePath('/admin');
}

type AuthFailure = { success: false; error: 'unauthorized' };

async function ensureAdmin(): Promise<AuthFailure | null> {
  try {
    await requireAdmin();
    return null;
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return { success: false, error: 'unauthorized' };
    }
    throw err; // ADMIN_PASSWORD unset: real server misconfig, let it surface
  }
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<ActionResult> {
  const authFailure = await ensureAdmin();
  if (authFailure) return authFailure;

  if (!id) return { success: false, error: 'invalid', message: 'ID is required' };
  if (!(INQUIRY_STATUSES as readonly string[]).includes(status)) {
    return { success: false, error: 'invalid', message: 'Invalid status' };
  }

  try {
    await fetchMutation(api.inquiries.updateStatus, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'inquiries'>,
      status,
    });
    revalidateInquiryViews();
    return { success: true };
  } catch (error) {
    console.error('Failed to update inquiry status:', error);
    return { success: false, error: 'failed', message: 'Could not update the inquiry status' };
  }
}

/** Returns the inquiry to the status it had before it was archived. */
export async function restoreInquiry(id: string): Promise<RestoreResult> {
  const authFailure = await ensureAdmin();
  if (authFailure) return authFailure;

  if (!id) return { success: false, error: 'invalid', message: 'ID is required' };

  try {
    const restoredStatus = await fetchMutation(api.inquiries.restore, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'inquiries'>,
    });
    revalidateInquiryViews();
    return { success: true, restoredStatus: restoredStatus as InquiryStatus };
  } catch (error) {
    console.error('Failed to restore inquiry:', error);
    return { success: false, error: 'failed', message: 'Could not restore the inquiry' };
  }
}

/** Saves the admin-only notes. Customer-submitted fields stay immutable. */
export async function updateAdminNotes(id: string, adminNotes: string): Promise<ActionResult> {
  const authFailure = await ensureAdmin();
  if (authFailure) return authFailure;

  if (!id) return { success: false, error: 'invalid', message: 'ID is required' };
  if (typeof adminNotes !== 'string' || adminNotes.length > 5000) {
    return { success: false, error: 'invalid', message: 'Notes must be 5000 characters or fewer' };
  }

  try {
    await fetchMutation(api.inquiries.updateAdminNotes, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'inquiries'>,
      adminNotes,
    });
    revalidateInquiryViews();
    return { success: true };
  } catch (error) {
    console.error('Failed to update inquiry notes:', error);
    return { success: false, error: 'failed', message: 'Could not save the notes' };
  }
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  const authFailure = await ensureAdmin();
  if (authFailure) return authFailure;

  if (!id) return { success: false, error: 'invalid', message: 'ID is required' };

  try {
    await fetchMutation(api.inquiries.remove, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'inquiries'>,
    });
    revalidateInquiryViews();
    return { success: true };
  } catch (error) {
    console.error('Failed to delete inquiry:', error);
    return { success: false, error: 'failed', message: 'Could not delete the inquiry' };
  }
}
