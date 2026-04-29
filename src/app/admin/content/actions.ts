'use server';

import { revalidatePath } from 'next/cache';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { requireAdmin } from '@/lib/auth';

export async function saveSiteContent(entries: Record<string, string>) {
  await requireAdmin();
  try {
    const payload = Object.entries(entries).map(([key, value]) => ({ key, value }));
    await fetchMutation(api.businessSettings.save, { entries: payload });
    await fetchMutation(api.activityLog.log, { action: 'Updated site content', section: 'Site Content' });

    revalidatePath('/', 'layout');
    revalidatePath('/about');
    revalidatePath('/weddings');
    revalidatePath('/private-events');
    revalidatePath('/menus');
    revalidatePath('/contact');

    return { success: true };
  } catch (error) {
    console.error('Failed to save site content:', error);
    return { success: false, error: 'Failed to save site content' };
  }
}

export async function saveBanner(data: { enabled: boolean; text: string; link: string; style: string; showOn?: string }) {
  await requireAdmin();
  try {
    await fetchMutation(api.businessSettings.save, {
      entries: [
        { key: 'banner_enabled', value: data.enabled ? 'true' : 'false' },
        { key: 'banner_text', value: data.text },
        { key: 'banner_link', value: data.link },
        { key: 'banner_style', value: data.style },
        { key: 'banner_show_on', value: data.showOn || 'all' },
      ],
    });
    await fetchMutation(api.activityLog.log, {
      action: data.enabled ? 'Enabled announcement banner' : 'Disabled announcement banner',
      section: 'Banner',
      details: data.text || undefined,
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch {
    return { success: false };
  }
}
