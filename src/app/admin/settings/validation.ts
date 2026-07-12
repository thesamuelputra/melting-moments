/**
 * Business-settings validation shared by the admin client (inline errors)
 * and the server action (authoritative check). Plain module — importable
 * from both 'use client' and 'use server' files.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lenient phone check: digits/spaces/dashes/dots/parens (optional leading +), at least 10 digits. */
export function isLenientPhone(value: string): boolean {
  if (!/^\+?[\d\s\-().]+$/.test(value)) return false;
  return (value.match(/\d/g) ?? []).length >= 10;
}

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Every key the settings module is allowed to write. */
export const SETTINGS_KEYS = [
  'name',
  'owner',
  'address',
  'phone',
  'email',
  'website',
  'social_instagram',
  'social_facebook',
  'social_google_business',
  'business_hours_note',
  'emailOnNewInquiry',
] as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[number];

const URL_KEYS: readonly string[] = ['website', 'social_instagram', 'social_facebook', 'social_google_business'];

/**
 * Validates the provided entries (only keys that are present are checked).
 * Returns a map of key → human-readable error; empty object means valid.
 */
export function validateSettingsEntries(entries: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [key, raw] of Object.entries(entries)) {
    const value = (raw ?? '').trim();
    if (key === 'name') {
      if (value === '') errors[key] = 'Business name is required';
    } else if (key === 'email') {
      if (value !== '' && !(EMAIL_RE.test(value) && value.length <= 200)) {
        errors[key] = 'Enter a valid email address';
      }
    } else if (key === 'phone') {
      if (value !== '' && !isLenientPhone(value)) {
        errors[key] = 'Enter a valid phone number (at least 10 digits)';
      }
    } else if (URL_KEYS.includes(key)) {
      if (value !== '' && !isHttpsUrl(value)) {
        errors[key] = 'Must be a full https:// URL';
      }
    } else if (key === 'emailOnNewInquiry') {
      if (value !== 'true' && value !== 'false') errors[key] = 'Invalid value';
    }
    // owner, address, business_hours_note: free text — no format rules
  }
  return errors;
}
