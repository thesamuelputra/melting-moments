import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';

/**
 * Fetch all site content from Convex businessSettings.
 * Returns a getter function: cms('key', 'fallback') → string
 */
export async function getCmsContent() {
  const settings = await fetchQuery(api.businessSettings.getAll);
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
