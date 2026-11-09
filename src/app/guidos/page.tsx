import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import StockistMap, { type Stockist } from '@/components/guidos/StockistMap';
import { inGreaterVictoria } from '@/components/guidos/stockist-map-geometry';
import { getGuidosProducts, getStockists } from '@/lib/cms';
import { GUIDOS_DELIVERY_FEE, JsonLd, SITE, breadcrumbList, productNodes } from '@/lib/seo';
import GuidosMenu from './GuidosMenu';
import { FALLBACK_PRODUCTS, type GuidosProduct } from './guidos-products';
import './guidos.css';

export const revalidate = 300;

export const metadata: Metadata = {
  // Guido's carries its own brand, so bypass the Melting Moments title template.
  title: { absolute: "Guido's Gourmet | Ready-Made Italian Meals, Victoria BC" },
  description: 'Homemade Italian meals ready to heat and serve: lasagnes, pot pies, soups, pasta and desserts, with delivery anywhere in Victoria, BC.',
  openGraph: {
    url: '/guidos',
    siteName: "Guido's Gourmet",
    locale: 'en_CA',
    type: 'website',
    images: [{ url: '/og/og-guidos.jpg', width: 1200, height: 630, alt: "Guido's Gourmet, ready-made Italian meals in Victoria BC" }],
  },
};

const COUNT_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

/** The Where to Buy heading: grocers sell the meals and restaurants have them on
 *  the menu, each named when there is one and counted when there are more. */
function whereToBuyLine(stockists: Stockist[]) {
  const name = (s: Stockist) => s.name.replace(/[.!?]+$/, '');
  const part = (list: Stockist[], verb: string, plural: string) =>
    list.length === 0
      ? null
      : list.length === 1
        ? { text: `${verb} at ${name(list[0])}`, list, counted: false }
        : { text: `${verb} at ${COUNT_WORDS[list.length] ?? list.length} ${plural}`, list, counted: true };
  const parts = [
    part(stockists.filter((s) => s.kind === 'grocery'), 'Sold', 'grocers'),
    part(stockists.filter((s) => s.kind === 'restaurant'), 'on the menu', 'restaurants'),
  ].filter((p) => p !== null);
  // The area follows a count and covers only the places counted, so it never
  // reads as the address of a place named on its own
  const counted = parts.filter((p) => p.counted).flatMap((p) => p.list);
  const where = !parts[parts.length - 1].counted
    ? ''
    : counted.every(inGreaterVictoria)
      ? ' around Victoria'
      : counted.some(inGreaterVictoria)
        ? ' in Victoria and beyond'
        : ' outside Victoria';
  const line = parts.map((p) => p.text).join(' and ') + where + '.';
  return line.charAt(0).toUpperCase() + line.slice(1);
}

export default async function GuidosPage() {
  const [items, stockistDocs] = await Promise.all([
    getGuidosProducts().catch((e) => {
      console.error('[cms] Convex unavailable; the Guido\'s menu shows the starting range', e);
      return [];
    }),
    getStockists().catch((e) => {
      console.error('[cms] Convex unavailable; the map shows the kitchen alone', e);
      return [];
    }),
  ]);

  // The owner's list from the admin, or the starting range while it is empty
  const products: GuidosProduct[] =
    items.length > 0
      ? items.map((item) => ({
          id: item._id,
          name: item.name,
          category: item.category,
          priceFrom: item.priceFrom,
          sizes: item.sizes ?? [],
          isAvailable: item.isAvailable,
          isLimitedEdition: item.isLimitedEdition,
        }))
      : FALLBACK_PRODUCTS;

  const stockists: Stockist[] = stockistDocs.map((s) => ({
    id: s._id,
    name: s.name,
    kind: s.kind === 'restaurant' ? 'restaurant' : 'grocery',
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    website: s.website,
    note: s.note,
  }));
  const hasStockists = stockists.length > 0;

  const howToGet = hasStockists
    ? 'Order online for delivery or pickup, or find us at the shops and restaurants below.'
    : 'Order online and we deliver anywhere in Victoria, or arrange a pickup from our kitchen in Esquimalt.';

  return (
    <div>
      <JsonLd data={breadcrumbList([{ name: 'Home', path: '/' }, { name: "Guido's Gourmet", path: '/guidos' }])} />
      <JsonLd
        data={productNodes(
          products.map((p) => ({ name: p.name, category: p.category, priceFrom: p.priceFrom, sizes: p.sizes, isAvailable: p.isAvailable })),
          `${SITE.url}/guidos`
        )}
      />

      {/* Header in the catering pages' grammar, with the tricolour as the one signature */}
      <header className="container" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>Ready-Made Italian Meals &middot; Victoria BC</div>
        <h1 className="haus-display" style={{ textTransform: 'uppercase' }}>
          Guido&apos;s<br />Gourmet
        </h1>
        <div className="g-tricolor g-tricolor--rule" aria-hidden="true" style={{ margin: 'clamp(1.5rem, 3vw, 2.5rem) 0 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginTop: '4rem', alignItems: 'center' }}>
          <div>
            <h2 className="noire-serif" style={{ marginBottom: '2rem' }}>
              Dinner from our kitchen, ready to heat and serve.
            </h2>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, marginBottom: '1.5rem', lineHeight: 1.7, maxWidth: '52ch' }}>
              We started in a family kitchen. Seventeen years later, the recipes are the same and the portions are
              bigger. Lasagnes, pot pies, soups, pasta and desserts, all made fresh by Chef Paul Silletta from recipes
              passed down through his family.
            </p>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, marginBottom: '2rem', lineHeight: 1.7, maxWidth: '52ch' }}>
              {howToGet}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link href="/guidos/order" className="btn-solid">Order Now</Link>
              <Link href="/guidos#stockists" className="btn-outline">Where to Buy</Link>
            </div>
          </div>
          <div className="shape-editorial-tall" style={{ position: 'relative', width: '100%' }}>
            <Image
              src="/chef_plating_sauce.webp"
              alt="Chef Paul Silletta plating a dish in the kitchen"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </header>

      <GuidosMenu products={products} />

      {/* Where to buy: the shops and restaurants the owner lists in the admin, with the kitchen for pickups */}
      <section
        id="stockists"
        className="container"
        aria-labelledby="g-where-title"
        style={{ marginTop: 'clamp(2rem, 4vw, 4rem)', scrollMarginTop: 'calc(var(--banner-height) + var(--nav-height) + 24px)' }}
      >
        <div className="menu-index" style={{ marginBottom: '2rem' }}>Where to Buy</div>
        <h2 id="g-where-title" className="noire-serif" style={{ maxWidth: '22em', textWrap: 'balance', marginBottom: '1.5rem' }}>
          {hasStockists ? whereToBuyLine(stockists) : 'From our kitchen in Esquimalt, by appointment, or delivered to your door.'}
        </h2>
        <p style={{ fontSize: 'var(--text-body)', opacity: 0.7, maxWidth: '52ch', lineHeight: 1.7, marginBottom: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
          {hasStockists
            ? `Or pick up from our kitchen in ${SITE.locality}, by appointment.`
            : `Order online and we deliver anywhere in Victoria for a flat ${GUIDOS_DELIVERY_FEE}. Pickup is by appointment; Paul arranges a time when he confirms your order.`}
        </p>
        <StockistMap stockists={stockists} />
      </section>

      {/* Delivery and pickup, on the deep green block */}
      <section className="g-block spacer-massive">
        <div className="container" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <div className="menu-index" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>Delivery and Pickup</div>
          <h2 className="noire-serif" style={{ color: 'var(--clr-oat)', marginBottom: '1.5rem' }}>
            Flat rate {GUIDOS_DELIVERY_FEE} anywhere in Victoria.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>Pickup by appointment.</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>{SITE.addressShort}.</p>
          <p className="g-tagline">When your hunger speaks Italian!</p>
          <Link href="/guidos/order" className="btn-outline btn-outline--inverse">Order Now</Link>
        </div>
      </section>
    </div>
  );
}
