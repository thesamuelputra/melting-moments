'use server';

import { revalidatePath } from 'next/cache';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';

export async function saveBusinessSettings(settings: Record<string, string>) {
  try {
    const entries = Object.entries(settings).map(([key, value]) => ({ key, value }));
    await fetchMutation(api.businessSettings.save, { entries });
    await fetchMutation(api.activityLog.log, { action: 'Updated business settings', section: 'Settings' });
    // Revalidate all pages that pull from settings
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
