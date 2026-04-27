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
