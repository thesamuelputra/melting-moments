import Link from 'next/link';
import type { Metadata } from 'next';
import GuidosWordmark from '@/components/guidos/GuidosWordmark';
import MenuCourses from '@/components/guidos/MenuCourses';
import StockistMap, { type Stockist } from '@/components/guidos/StockistMap';
import { describeCourses, toCourses, type ProductLike } from '@/components/guidos/menu-data';
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

/* ===== How the stockists are described ===== */

type Place = { name: string; kind: 'restaurant' | 'grocery'; address: string; lat: number; lng: number };

// Roughly the Capital Region's urban core, Langford to Oak Bay
const inGreaterVictoria = (p: Place) => p.lat >= 48.38 && p.lat <= 48.6 && p.lng >= -123.62 && p.lng <= -123.25;

const countOf = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Words for the stockists that match what is really on the map: which
 *  kinds of place there are, how many, and how far they spread. */
function describePlaces(places: Place[]) {
  const grocers = places.filter((p) => p.kind === 'grocery').length;
  const restaurants = places.length - grocers;
  const where = places.every(inGreaterVictoria) ? 'around Victoria' : 'in Victoria and beyond';
  if (places.length === 1) {
    const only = places[0];
    return {
      tally: `${only.name}, ${only.address}`,
      intro: `Pick up from Paul’s kitchen in ${SITE.locality} by appointment, or find Guido’s at ${only.name.replace(/[.!?]+$/, '')}.`,
    };
  }
  const tally =
    [grocers ? countOf(grocers, 'grocer', 'grocers') : '', restaurants ? countOf(restaurants, 'restaurant', 'restaurants') : '']
      .filter(Boolean)
      .join(' and ') + ` ${where}`;
  const kinds = grocers && restaurants ? 'these grocers and restaurants' : grocers ? 'these grocers' : 'these restaurants';
  return { tally, intro: `Pick up from Paul’s kitchen in ${SITE.locality} by appointment, or find Guido’s at ${kinds}.` };
}

/* ===== Page ===== */

export default async function GuidosPage() {
  const [items, rawStockists] = await Promise.all([
    getGuidosProducts().catch(() => []),
    getStockists().catch(() => []),
  ]);

  const products: ProductLike[] = items.length > 0 ? items : GUIDOS_FALLBACK_PRODUCTS;
  const courses = toCourses(products);

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
  const words = stockists.length > 0 ? describePlaces(stockists) : null;

  return (
    <>
      <JsonLd data={breadcrumbList([{ name: 'Home', path: '/' }, { name: "Guido's Gourmet", path: '/guidos' }])} />

      {/* The cover: the logo with room around it, and plainly what this is */}
      <section className="gg-hero" aria-labelledby="gg-hero-title">
        <div className="gg-hero-plane" aria-hidden="true">
          <GuidosWordmark tagline="When your hunger speaks Italian!" wordSize="clamp(56px, 3rem + 3.6vw, 104px)" />
        </div>
        <div className="gg-hero-main">
          <h1 id="gg-hero-title" className="gg-display">
            <span className="gg-sr-only">Guido&rsquo;s Gourmet. </span>
            Homemade Italian meals, ready to heat and serve.
          </h1>
          <p className="gg-lede">
            {describeCourses(courses)}, made by Chef Paul Silletta in his kitchen in {SITE.locality} since 2009.
          </p>
          <div className="gg-actions">
            <Link className="gg-btn gg-btn--light" href="/guidos/order">Request an order</Link>
            <Link className="gg-textlink" href="/guidos/menu">See the full menu</Link>
          </div>
          <dl className="gg-hero-facts">
            <div>
              <dt>Delivery</dt>
              <dd>{GUIDOS_DELIVERY_FEE} flat, anywhere in Victoria</dd>
            </div>
            <div>
              <dt>Pickup</dt>
              <dd>By appointment in {SITE.locality}</dd>
            </div>
            {words && (
              <div>
                <dt>{stockists.length === 1 ? 'Stockist' : 'Stockists'}</dt>
                <dd><a href="#stockists">{words.tally}</a></dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* The menu, set like the printed card */}
      <section className="gg-section" aria-labelledby="gg-menu-title">
        <div className="gg-wrap gg-split">
          <div className="gg-split-head">
            <h2 id="gg-menu-title" className="gg-h2">The menu</h2>
            <p>Prices are for the smallest size. Family and party sizes are on the full menu.</p>
            <Link className="gg-textlink" href="/guidos/menu">Full menu and sizes</Link>
          </div>
          <MenuCourses courses={courses} variant="card" />
        </div>
      </section>

      {/* Where it comes from */}
      <section className="gg-story" aria-labelledby="gg-story-title">
        <div className="gg-wrap">
          <div className="gg-story-inner">
            <h2 id="gg-story-title" className="gg-story-quote">
              We started in a family kitchen. Seventeen years later, the recipes are the same. The portions are bigger.
            </h2>
            <p>
              Good food at a fair price. Order online or visit by appointment. Everything is made fresh by Chef Paul Silletta using traditional Italian recipes passed down through generations.
            </p>
            <Link className="gg-textlink" href="/chef-paul">Meet Chef Paul</Link>
          </div>
        </div>
      </section>

      {/* Where to find it. The tabIndex lets "Where to buy" bring focus here, not just the scroll. */}
      <section className="gg-where" id="stockists" tabIndex={-1} aria-labelledby="gg-where-title">
        <div className="gg-wrap">
          <div className="gg-where-inner">
            <div className="gg-where-head">
              <h2 id="gg-where-title" className="gg-h2">Where to find Guido&rsquo;s</h2>
              <p>
                {words
                  ? words.intro
                  : 'Grocers and restaurants that carry our meals will be listed here.'}
              </p>
            </div>
            <StockistMap stockists={stockists} />
          </div>
        </div>
      </section>
    </>
  );
}
