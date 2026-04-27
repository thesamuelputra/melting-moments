'use server';

import { revalidatePath } from 'next/cache';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';

export async function saveSiteContent(entries: Record<string, string>) {
  try {
    const payload = Object.entries(entries).map(([key, value]) => ({ key, value }));
    await fetchMutation(api.businessSettings.save, { entries: payload });

    // Revalidate all public pages that consume CMS content
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
