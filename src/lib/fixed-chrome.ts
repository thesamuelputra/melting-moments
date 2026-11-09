/**
 * Bottom edge of the fixed chrome in viewport coordinates: the announcement
 * banner, the nav, and a pinned section rail where one is showing. Anchor
 * jumps and scroll-spy reading lines measure from this, so a jump always lands
 * below the bar and lights the section it jumped to, whatever the banner and
 * nav happen to measure.
 */
export function chromeBottom(rail: HTMLElement | null): number {
  const root = getComputedStyle(document.documentElement);
  const num = (name: string, fallback: number) =>
    parseFloat(root.getPropertyValue(name)) || fallback;
  const railHeight =
    rail && getComputedStyle(rail).display !== 'none'
      ? rail.getBoundingClientRect().height
      : 0;
  return num('--banner-height', 0) + num('--nav-height', 61) + railHeight;
}
