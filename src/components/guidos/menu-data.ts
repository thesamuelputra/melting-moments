/**
 * Shapes the Guido's products (from the CMS, or the built-in menu when the
 * CMS is empty) into courses for the menu card on the landing page, the
 * full menu page and the price list beside the order form.
 */

export type ProductLike = {
  name: string;
  category: string;
  priceFrom: number;
  sizes?: { label: string; price: number }[];
  image?: string;
  isAvailable: boolean;
  isLimitedEdition: boolean;
};

export type Dish = {
  key: string;
  name: string;
  qualifier?: string;
  price: number;
  sizes: { label: string; price: number }[];
  limited: boolean;
  soldOut: boolean;
  image?: string;
};

export type Course = { id: string; title: string; dishes: Dish[] };

// The order a diner reads a menu in; a category the owner adds lands before Holiday
const COURSE_ORDER = ['Lasagnes', 'Pasta', 'Soups', 'Pot Pies', 'Desserts', 'Holiday'];
const courseRank = (title: string) => {
  const i = COURSE_ORDER.indexOf(title);
  return i === -1 ? COURSE_ORDER.length - 1.5 : i;
};

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A trailing "(5 Flavours)" or a "w/ Roasted Veg" reads better as a quiet
 *  line under the dish than squeezed into the name. Kept as the owner typed it. */
function splitQualifier(raw: string): { name: string; qualifier?: string } {
  const paren = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (paren) return { name: paren[1], qualifier: capitalise(paren[2]) };
  const w = raw.split(/\s+w\/\s+/i);
  if (w.length === 2) return { name: w[0], qualifier: `With ${w[1]}` };
  return { name: raw };
}

export const formatPrice = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'course';

export function toCourses(products: ProductLike[], resolveImage?: (src?: string) => string | undefined): Course[] {
  const byTitle = new Map<string, Dish[]>();
  products.forEach((p, i) => {
    const { name, qualifier } = splitQualifier(p.name.trim());
    const list = byTitle.get(p.category) ?? [];
    list.push({
      key: `${p.category}-${i}`,
      name,
      qualifier,
      price: p.priceFrom,
      sizes: p.sizes ?? [],
      limited: p.isLimitedEdition,
      soldOut: !p.isAvailable,
      image: resolveImage ? resolveImage(p.image) : undefined,
    });
    byTitle.set(p.category, list);
  });
  const used = new Set<string>();
  return [...byTitle.entries()]
    .sort((a, b) => courseRank(a[0]) - courseRank(b[0]))
    .map(([title, dishes]) => {
      let id = `menu-${slug(title)}`;
      while (used.has(id)) id += '-2';
      used.add(id);
      return { id, title, dishes };
    });
}

/** "Lasagnes, pasta, soups, pot pies and desserts", from what is on the menu */
export function describeCourses(courses: Course[]): string {
  // Seasonal courses (Holiday, or any course that is all limited editions) stay out.
  // The standard course names read as common nouns; names the owner adds keep
  // the capitals they were typed with (Christmas, GF Pasta).
  const names = courses
    .filter((c) => c.title !== 'Holiday' && !c.dishes.every((d) => d.limited))
    .map((c) => (COURSE_ORDER.includes(c.title) ? c.title.toLowerCase() : c.title));
  if (names.length === 0) return 'Homemade Italian dishes';
  const text = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  return capitalise(text);
}
