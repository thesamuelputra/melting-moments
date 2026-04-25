'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

export async function saveBusinessSettings(settings: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(settings)) {
      await db.businessSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to save settings:', error);
    return { success: false, error: 'Failed to save settings' };
  }
}
