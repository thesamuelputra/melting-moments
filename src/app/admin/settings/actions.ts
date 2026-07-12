'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { AdminAuthError, requireAdmin } from '@/lib/auth';
import { SETTINGS_KEYS, validateSettingsEntries } from './validation';

type ActionResult =
  | { success: true }
  | { success: false; error: 'unauthorized' | 'invalid' | 'failed'; message?: string };

/**
 * Persists only the entries it receives (the client sends a dirty-key diff).
 * Validation mirrors the client-side checks — bad values never reach Convex.
 */
export async function saveBusinessSettings(settings: Record<string, string>): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminAuthError) return { success: false, error: 'unauthorized' };
    throw err; // ADMIN_PASSWORD unset — real server misconfig, let it surface
  }

  const pairs = Object.entries(settings ?? {});
  if (pairs.length === 0) {
    return { success: false, error: 'invalid', message: 'Nothing to save' };
  }
  for (const [key, value] of pairs) {
    if (!(SETTINGS_KEYS as readonly string[]).includes(key) || typeof value !== 'string') {
      return { success: false, error: 'invalid', message: `Unknown setting "${key}"` };
    }
  }
  const errors = validateSettingsEntries(settings);
  const firstError = Object.values(errors)[0];
  if (firstError) {
    return { success: false, error: 'invalid', message: firstError };
  }

  try {
    await fetchMutation(api.businessSettings.save, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      // Activity is logged inside the mutation (default "Updated business settings").
      entries: pairs.map(([key, value]) => ({ key, value: value.trim() })),
    });

    updateTag('cms');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');

    return { success: true };
  } catch (error) {
    console.error('Failed to save settings:', error);
    return { success: false, error: 'failed', message: 'Could not save settings' };
  }
}
