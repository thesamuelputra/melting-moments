import { unstable_cache } from 'next/cache';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';

// All public-page Convex reads go through unstable_cache so marketing pages
// render as ISR (pair with `export const revalidate = 300` in the page)
// instead of per-request dynamic. Admin server actions call
// revalidateTag(CMS_TAG) after content edits so changes appear immediately.
export const CMS_TAG = 'cms';
const REVALIDATE_SECONDS = 300;

const cachedSettings = unstable_cache(
  () => fetchQuery(api.businessSettings.getAll),
  ['business-settings'],
  { revalidate: REVALIDATE_SECONDS, tags: [CMS_TAG] }
);

export const getTestimonials = unstable_cache(
  () => fetchQuery(api.testimonials.listActive),
  ['testimonials-active'],
  { revalidate: REVALIDATE_SECONDS, tags: [CMS_TAG] }
);

export const getMenuItems = unstable_cache(
  () => fetchQuery(api.menuItems.listActive),
  ['menu-items-active'],
  { revalidate: REVALIDATE_SECONDS, tags: [CMS_TAG] }
);

export const getFaqs = unstable_cache(
  () => fetchQuery(api.faqs.listActive),
  ['faqs-active'],
  { revalidate: REVALIDATE_SECONDS, tags: [CMS_TAG] }
);

export const getGuidosProducts = unstable_cache(
  () => fetchQuery(api.guidosProducts.list),
  ['guidos-products'],
  { revalidate: REVALIDATE_SECONDS, tags: [CMS_TAG] }
);

/**
 * Business settings with outage protection: a Convex failure degrades to the
 * hardcoded fallback copy baked into every page instead of a 500.
 */
export async function getSettings(): Promise<Record<string, string>> {
  try {
    return await cachedSettings();
  } catch (e) {
    console.error('[cms] Convex unavailable; serving hardcoded fallback content', e);
    return {};
  }
}

/**
 * Fetch all site content from Convex businessSettings.
 * Returns a getter function: cms('key', 'fallback') → string
 */
export async function getCmsContent() {
  const settings = await getSettings();
  return function cms(key: string, fallback: string): string {
    return settings[key] || fallback;
  };
}

/**
 * Helper for pages that already have a settings map (Record<string,string>).
 * Avoids a second round-trip to Convex.
 */
export function getCmsValue(settings: Record<string, string>, key: string, fallback: string): string {
  return settings[key] || fallback;
}
