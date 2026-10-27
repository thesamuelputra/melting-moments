/**
 * A stockist's website is optional; when given it must be a real http(s)
 * address of at most 300 characters. A bare domain like "example.ca" is
 * accepted and given https.
 * Shared by the admin form, which checks before saving, and the server
 * action, which has the final say.
 */
export const MAX_WEBSITE = 300;

export function normaliseWebsite(raw: string | undefined): { ok: true; value: string } | { ok: false } {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return { ok: true, value: '' };
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) return { ok: false };
    const value = url.toString();
    // The cap applies to the stored form, which can be longer than typed
    if (value.length > MAX_WEBSITE) return { ok: false };
    return { ok: true, value };
  } catch {
    return { ok: false };
  }
}
