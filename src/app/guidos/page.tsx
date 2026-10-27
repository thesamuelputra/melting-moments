import Link from 'next/link';
import type { Metadata } from 'next';
import GuidosWordmark, { GuidosCrest } from '@/components/guidos/GuidosWordmark';
import StockistMap, { type Stockist } from '@/components/guidos/StockistMap';
import { getGuidosProducts, getStockists } from '@/lib/cms';
import { GUIDOS_FALLBACK_PRODUCTS } from '@/lib/guidos-fallback-products';
import { GUIDOS_DELIVERY_FEE, JsonLd, SITE, breadcrumbList } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = {
  // Guido's carries its own brand, so bypass the Melting Moments title template.
  title: { absolute: "Guido's Gourmet | Ready-Made Italian Meals, Victoria BC" },
  description: 'Homemade Italian meals ready to heat and serve. Lasagnes, pot pies, soups, pasta, and desserts. Delivery available in Victoria, BC, and sold at local grocers and restaurants.',
  openGraph: {
    url: '/guidos',
    siteName: "Guido's Gourmet",
    locale: 'en_CA',
    type: 'website',
    images: [{ url: '/og/og-guidos.jpg', width: 1200, height: 630, alt: "Guido's Gourmet, ready-made Italian meals in Victoria BC" }],
  },
};

/* ===== The menu card ===== */

type Dish = {
  key: string;
  name: string;
  meta?: string;
  price: number;
  hasSizes: boolean;
  special: boolean;
  soldOut: boolean;
};
type Course = { title: string; dishes: Dish[] };

// The order a diner reads a menu in; anything new lands before Holiday
const COURSE_ORDER = ['Lasagnes', 'Pasta', 'Soups', 'Pot Pies', 'Desserts', 'Holiday'];
const courseRank = (title: string) => {
  const i = COURSE_ORDER.indexOf(title);
  return i === -1 ? COURSE_ORDER.length - 1.5 : i;
};

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

// Capitalise the first letter only, so "GF" or "BC Salmon" stay as typed
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A trailing "(5 Flavours)" or a "w/ Roasted Veg" reads better as a quiet
 *  line under the dish than squeezed into the name. */
function splitQualifier(raw: string): { name: string; qualifier?: string } {
  const paren = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (paren) return { name: paren[1], qualifier: capitalise(paren[2]) };
  const w = raw.split(/\s+w\/\s+/i);
  if (w.length === 2) return { name: w[0], qualifier: `With ${w[1]}` };
  return { name: raw };
}

const formatPrice = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

type ProductLike = {
  name: string;
  category: string;
  priceFrom: number;
  sizes?: { label: string; price: number }[];
  isAvailable: boolean;
  isLimitedEdition: boolean;
};

function toCourses(products: ProductLike[]): Course[] {
  const byTitle = new Map<string, Dish[]>();
  products.forEach((p, i) => {
    const { name, qualifier } = splitQualifier(p.name.trim());
    const sizes = p.sizes ?? [];
    const sizeLine = sizes.length > 1 ? sizes.map((s) => s.label).join(' or ') : undefined;
    const meta = [qualifier, sizeLine].filter(Boolean).join(' · ') || undefined;
    const list = byTitle.get(p.category) ?? [];
    list.push({ key: `${p.category}-${i}`, name, meta, price: p.priceFrom, hasSizes: sizes.length > 1, special: p.isLimitedEdition, soldOut: !p.isAvailable });
    byTitle.set(p.category, list);
  });
  return [...byTitle.entries()]
    .map(([title, dishes]) => ({ title, dishes }))
    .sort((a, b) => courseRank(a.title) - courseRank(b.title));
}

/** Splits the courses, in order, into three columns of as even a height as
 *  possible. The last column also carries the sign-off, so it counts extra. */
function intoColumns(courses: Course[]): Course[][] {
  const height = (c: Course) => 1.4 + c.dishes.reduce((h, d) => h + (d.special ? 1.8 : d.meta ? 1.3 : 1), 0);
  const sum = (cs: Course[]) => cs.reduce((h, c) => h + height(c), 0);
  const n = courses.length;
  if (n <= 3) return [courses.slice(0, 1), courses.slice(1, 2), courses.slice(2)];
  let best: Course[][] = [courses, [], []];
  let bestScore = Infinity;
  for (let a = 1; a < n - 1; a++) {
    for (let b = a + 1; b < n; b++) {
      const cols = [courses.slice(0, a), courses.slice(a, b), courses.slice(b)];
      const score = Math.max(sum(cols[0]), sum(cols[1]), sum(cols[2]) + 3);
      if (score < bestScore) { bestScore = score; best = cols; }
    }
  }
  return best;
}

/* ===== How the stockists are described ===== */

type Place = { name: string; kind: 'restaurant' | 'grocery'; address: string; lat: number; lng: number };

// Roughly the Capital Regional District's urban core, Langford to Oak Bay
const inGreaterVictoria = (p: Place) => p.lat >= 48.38 && p.lat <= 48.6 && p.lng >= -123.62 && p.lng <= -123.25;

const countOf = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Words for the stockists that match what is really on the map: which
 *  kinds of place there are, how many, and how far they spread. */
function describePlaces(places: Place[]) {
  const grocers = places.filter((p) => p.kind === 'grocery').length;
  const restaurants = places.length - grocers;
  const where = places.every(inGreaterVictoria) ? 'around Victoria' : 'in Victoria and beyond';
  const kinds = grocers && restaurants ? 'grocers and restaurants' : grocers ? 'grocers' : 'restaurants';
  const tally =
    places.length === 1
      ? `${places[0].name}, ${places[0].address}`
      : [grocers ? countOf(grocers, 'grocer', 'grocers') : '', restaurants ? countOf(restaurants, 'restaurant', 'restaurants') : '']
          .filter(Boolean)
          .join(' and ') + ` ${where}`;
  if (places.length === 1) {
    const only = places[0];
    // A name like "Fairfield Market Ltd." already ends the sentence
    const name = only.name.replace(/[.!?]+$/, '');
    const end = only.name.slice(name.length) || '.';
    return {
      lede: only.name,
      ledeEnd: name === only.name ? '.' : '',
      tally,
      shelves: only.kind === 'grocery' ? `Our meals are on the shelves at ${name}${end}` : `Our meals are on the menu at ${name}${end}`,
    };
  }
  const shelves =
    grocers && restaurants
      ? 'Our meals are on the shelves of local grocers and the menus of local restaurants.'
      : grocers
        ? 'Our meals are on the shelves of local grocers.'
        : 'Our meals are on the menus of local restaurants.';
  return { lede: `local ${kinds} ${where}`, ledeEnd: '.', tally, shelves };
}

/* ===== Page ===== */

export default async function GuidosPage() {
  const [items, rawStockists] = await Promise.all([
    getGuidosProducts().catch(() => []),
    // Until the stockists table reaches a deployment, the map shows the kitchen alone
    getStockists().catch(() => []),
  ]);

  const products: ProductLike[] = items.length > 0 ? items : GUIDOS_FALLBACK_PRODUCTS;
  const courses = toCourses(products);
  const columns = intoColumns(courses);
  let courseNumber = 0;

  const stockists: Stockist[] = rawStockists.map((s) => ({
    id: s._id,
    name: s.name,
    kind: s.kind === 'restaurant' ? 'restaurant' : 'grocery',
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    website: s.website,
    note: s.note,
  }));
  const placeCount = stockists.length;
  const words = placeCount > 0 ? describePlaces(stockists) : null;

  return (
    <div className="g-landing">
      <JsonLd data={breadcrumbList([{ name: 'Home', path: '/' }, { name: "Guido's Gourmet", path: '/guidos' }])} />

      {/* 1. The cover */}
      <section className="g-cover" aria-labelledby="g-cover-title">
        <div className="container">
          <div className="g-dateline">
            <p className="g-eyebrow">Est. 2009 &middot; Victoria BC</p>
            <p className="g-eyebrow">Italian Heritage &middot; Ready-Made Meals</p>
          </div>

          <div className="g-cover__grid">
            <div className="g-cover__mark" aria-hidden="true">
              <GuidosWordmark tagline="When your hunger speaks Italian!" wordSize="clamp(56px, 8.4vw, 124px)" />
            </div>

            <div className="g-cover__copy">
              <h1 id="g-cover-title" className="g-cover__title">
                <span className="sr-only">Guido&rsquo;s Gourmet. </span>
                Homemade Italian meals, <em>ready to heat and serve.</em>
              </h1>
              <p className="g-lede">
                From Chef Paul Silletta&rsquo;s kitchen in {SITE.locality}, since 2009. Order for delivery or pickup
                {words ? `, or find them at ${words.lede}${words.ledeEnd}` : '.'}
              </p>
              <div className="g-actions">
                <Link className="g-btn" href="/guidos/order">Order now</Link>
                <Link className="g-textlink" href="/guidos/menu">View the full menu</Link>
              </div>
              <dl className="g-cover__key">
                <dt>Delivery</dt>
                <dd>{GUIDOS_DELIVERY_FEE} flat, anywhere in Victoria</dd>
                <dt>Pickup</dt>
                <dd>By appointment, {SITE.addressShort}</dd>
                {words && (
                  <>
                    <dt>{placeCount === 1 ? 'Stockist' : 'Stockists'}</dt>
                    <dd>
                      <a className="g-textlink g-textlink--quiet" href="#stockists">
                        {words.tally}
                      </a>
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The menu, set as a printed card */}
      <section className="g-section" aria-labelledby="g-menu-title">
        <div className="container">
          <header className="g-sec-head">
            <div>
              <p className="g-eyebrow">The menu</p>
              <h2 id="g-menu-title" className="g-h2">The whole menu, <em>at a glance.</em></h2>
            </div>
            <p className="g-sec-head__note">Prices are for the smallest size. Every size and price is on the full menu.</p>
          </header>

          <div className="g-menu-card">
            <span className="g-tricolor g-menu-card__cap" aria-hidden="true" />
            <div className="g-courses">
              {columns.map((col, ci) => (
                <div key={ci} className={`g-courses__col g-courses__col--${ci + 1}`}>
                  {col.map((course) => {
                    const numeral = ROMAN[courseNumber++] ?? String(courseNumber);
                    return (
                      <section className="g-course" key={course.title} aria-labelledby={`g-course-${numeral}`}>
                        <h3 className="g-course__head" id={`g-course-${numeral}`}>
                          <span className="g-course__num" aria-hidden="true">{numeral}</span>
                          {course.title}
                        </h3>
                        <ul className="g-course__list">
                          {course.dishes.map((d) => (
                            <li key={d.key} className={`g-dish${d.special ? ' g-dish--special' : ''}${d.soldOut ? ' is-sold-out' : ''}`}>
                              {(d.special || d.soldOut) && (
                                <span className="g-dish__flag">{d.soldOut ? 'Sold out' : 'Limited edition'}</span>
                              )}
                              <span className="g-dish__name">{d.name}</span>
                              <span className="g-dish__leader" aria-hidden="true" />
                              <span className="g-dish__price">
                                <small>from</small>
                                {formatPrice(d.price)}
                              </span>
                              {d.meta && <span className="g-dish__meta">{d.meta}</span>}
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })}
                  {ci === columns.length - 1 && (
                    <div className="g-card-sign">
                      <p className="g-script">Chef crafted. Handmade. Made with love.</p>
                      <div className="g-actions">
                        <Link className="g-btn" href="/guidos/order">Order now</Link>
                        <Link className="g-textlink" href="/guidos/menu">View the full menu</Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Roots */}
      <section className="g-roots" aria-labelledby="g-roots-title">
        <div className="container g-roots__grid">
          <p className="g-eyebrow g-roots__eyebrow" id="g-roots-title">Our roots</p>
          <blockquote className="g-roots__quote">
            We started in a family kitchen. Seventeen years later, the recipes are the same. <em>The portions are bigger.</em>
          </blockquote>
          <p className="g-roots__side">
            Good food at a fair price. Order online or visit by appointment. Everything is made fresh by Chef Paul Silletta using traditional Italian recipes passed down through generations.
          </p>
        </div>
      </section>

      {/* 4. Where to find it */}
      <section className="g-stockists" id="stockists" aria-labelledby="g-map-title">
        <div className="container">
          <header className="g-sec-head">
            <div>
              <p className="g-eyebrow">The map</p>
              <h2 id="g-map-title" className="g-h2">Where to find <em>Guido&rsquo;s</em></h2>
            </div>
            <p className="g-sec-head__note">
              {words
                ? `${words.shelves} You can also pick up from our kitchen in ${SITE.locality}, by appointment.`
                : `Pick up from our kitchen in ${SITE.locality}, by appointment. Grocers and restaurants that carry our meals will show here as they come on.`}
            </p>
          </header>
          <StockistMap stockists={stockists} />
        </div>
      </section>

      {/* 5. Delivery and pickup, on the deep green */}
      <section className="g-order" aria-labelledby="g-order-title">
        <div className="container g-order__grid">
          <div className="g-order__seal">
            <div aria-hidden="true">
              <GuidosCrest tone="cream" size="clamp(150px, 18vw, 240px)" />
            </div>
            <p className="g-script">Quando la fame parla, parla Italiano!</p>
          </div>
          <div>
            <p className="g-eyebrow">Delivery and pickup</p>
            <h2 id="g-order-title" className="g-order__title">
              Flat rate: <em>{GUIDOS_DELIVERY_FEE}</em> anywhere in Victoria.
            </h2>
            <dl className="g-order__facts">
              <div>
                <dt>Delivery</dt>
                <dd>Order online and we bring it to your door, anywhere in Victoria.</dd>
              </div>
              <div>
                <dt>Pickup</dt>
                <dd>By appointment at our kitchen, {SITE.addressShort}.</dd>
              </div>
            </dl>
            <div className="g-actions">
              <Link className="g-btn g-btn--cream" href="/guidos/order">Order now</Link>
              <Link className="g-textlink g-textlink--cream" href="/guidos/menu">View the full menu</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
