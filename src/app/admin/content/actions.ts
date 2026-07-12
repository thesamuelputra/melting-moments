'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { AdminAuthError, requireAdmin } from '@/lib/auth';
import {
  BANNER_TEXT_ERROR,
  BANNER_LINK_ERROR,
  isBannerShowOn,
  isBannerStyle,
  isValidBannerLink,
} from '../banner/validation';

type ActionResult =
  | { success: true }
  | { success: false; error: 'unauthorized' | 'invalid' | 'failed'; message?: string };

const MAX_CONTENT_KEYS = 200;
const MAX_CONTENT_VALUE_LENGTH = 5000;

/**
 * Persists only the entries it receives: the client sends a dirty-key diff,
 * never the full schema, so untouched keys are never blanket-published.
 */
export async function saveSiteContent(entries: Record<string, string>): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminAuthError) return { success: false, error: 'unauthorized' };
    throw err; // ADMIN_PASSWORD unset: real server misconfig, let it surface
  }

  const pairs = Object.entries(entries ?? {});
  if (pairs.length === 0) {
    return { success: false, error: 'invalid', message: 'Nothing to publish' };
  }
  if (pairs.length > MAX_CONTENT_KEYS) {
    return { success: false, error: 'invalid', message: 'Too many fields in one save' };
  }
  for (const [key, value] of pairs) {
    if (key.trim() === '' || typeof value !== 'string') {
      return { success: false, error: 'invalid', message: 'Malformed content payload' };
    }
    if (value.length > MAX_CONTENT_VALUE_LENGTH) {
      return { success: false, error: 'invalid', message: `"${key}" is too long` };
    }
  }

  try {
    await fetchMutation(api.businessSettings.save, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      entries: pairs.map(([key, value]) => ({ key, value })),
      // Activity is logged inside the mutation; this override labels it correctly.
      activity: { action: 'Updated site content', section: 'Site Content' },
    });

    updateTag('cms');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content');

    return { success: true };
  } catch (error) {
    console.error('Failed to save site content:', error);
    return { success: false, error: 'failed', message: 'Could not save content' };
  }
}

export type BannerPayload = {
  enabled: boolean;
  text: string;
  link: string;
  style: string;
  showOn: string;
};

export async function saveBanner(data: BannerPayload): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminAuthError) return { success: false, error: 'unauthorized' };
    throw err;
  }

  // Server-side validation mirroring the client checks.
  const text = (data.text ?? '').trim();
  const link = (data.link ?? '').trim();
  if (data.enabled && text === '') {
    return { success: false, error: 'invalid', message: BANNER_TEXT_ERROR };
  }
  if (!isValidBannerLink(link)) {
    return { success: false, error: 'invalid', message: BANNER_LINK_ERROR };
  }
  if (!isBannerStyle(data.style)) {
    return { success: false, error: 'invalid', message: 'Unknown banner style' };
  }
  if (!isBannerShowOn(data.showOn)) {
    return { success: false, error: 'invalid', message: 'Unknown banner targeting' };
  }

  try {
    await fetchMutation(api.businessSettings.save, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      entries: [
        { key: 'banner_enabled', value: data.enabled ? 'true' : 'false' },
        { key: 'banner_text', value: text },
        { key: 'banner_link', value: link },
        { key: 'banner_style', value: data.style },
        { key: 'banner_show_on', value: data.showOn },
      ],
      activity: {
        action: data.enabled ? 'Enabled announcement banner' : 'Disabled announcement banner',
        section: 'Banner',
        details: text || undefined,
      },
    });

    updateTag('cms');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/banner');

    return { success: true };
  } catch (error) {
    console.error('Failed to save banner:', error);
    return { success: false, error: 'failed', message: 'Could not save the banner' };
  }
}
