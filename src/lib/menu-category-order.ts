/**
 * Curated default order of catering menu sections — the single source of
 * truth shared by the public /menus page and the admin Menu Editor's
 * "Order categories" panel, so both sides agree on what "unset" means.
 * Persisted overrides live in the businessSettings key `menu_category_order`.
 */
export const DEFAULT_CATEGORY_ORDER = [
  'BREADS', 'ANTIPASTO', 'SALADS', 'STARCHES', 'VEGETABLES',
  'SEAFOOD', 'ENTREES', 'PACKAGES', 'SOIREE', 'PEASANO',
  'MEXICAN', 'BBQ', 'LUNCH', 'BREAKFAST', 'BEVERAGES',
];

/**
 * Resolve the effective category order: saved order first (if any), else the
 * curated default; categories present in the data but missing from the base
 * list are appended alphabetically so nothing ever disappears.
 */
export function resolveCategoryOrder(saved: string[], dataCategories: string[]): string[] {
  const base = saved.length > 0 ? saved : DEFAULT_CATEGORY_ORDER;
  const known = new Set(base);
  const unknown = Array.from(new Set(dataCategories.filter((c) => !known.has(c)))).sort();
  return [...base.filter((c) => known.has(c)), ...unknown].filter(
    (c, i, arr) => arr.indexOf(c) === i
  );
}
