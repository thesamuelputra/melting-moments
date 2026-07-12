/**
 * Banner validation shared by the admin client (inline errors) and the
 * server action (authoritative check). Plain module: no 'use client' /
 * 'use server', so both sides can import it.
 */

export const BANNER_STYLES = ['dark', 'accent', 'light'] as const;
export type BannerStyle = (typeof BANNER_STYLES)[number];

export const BANNER_SHOW_ON = ['all', 'catering', 'guidos', 'home'] as const;
export type BannerShowOn = (typeof BANNER_SHOW_ON)[number];

export function isBannerStyle(value: string): value is BannerStyle {
  return (BANNER_STYLES as readonly string[]).includes(value);
}

export function isBannerShowOn(value: string): value is BannerShowOn {
  return (BANNER_SHOW_ON as readonly string[]).includes(value);
}

/**
 * The banner link is optional. When present it must be either a same-site
 * relative path ('/contact') or an absolute https:// URL. Everything else
 * (javascript:, data:, http:, protocol-relative '//evil.com') is rejected,
 * because the value is rendered as a <Link href> on every public page.
 */
export function isValidBannerLink(link: string): boolean {
  const trimmed = link.trim();
  if (trimmed === '') return true;
  if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
  try {
    return new URL(trimmed).protocol === 'https:';
  } catch {
    return false;
  }
}

export const BANNER_LINK_ERROR = "Must be a relative path (e.g. /contact) or a full https:// URL";
export const BANNER_TEXT_ERROR = 'Banner text is required while the banner is enabled';
