'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { requireAdmin } from '@/lib/auth';

export async function saveBusinessSettings(settings: Record<string, string>) {
  await requireAdmin();
  try {
    const entries = Object.entries(settings).map(([key, value]) => ({ key, value }));
    await fetchMutation(api.businessSettings.save, { adminSecret: process.env.ADMIN_PASSWORD!, entries });
    await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: 'Updated business settings', section: 'Settings' });
    // Revalidate all pages that pull from settings
    updateTag('cms');
    revalidatePath('/', 'layout');
    revalidatePath('/contact');
    revalidatePath('/corporate');
    revalidatePath('/', 'layout'); // banner
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to save settings:', error);
    return { success: false, error: 'Failed to save settings' };
  }
}
