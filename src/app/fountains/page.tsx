import { Metadata } from 'next';
import Image from 'next/image';
import { AREA_SERVED, BUSINESS_ID, JsonLd, SITE, breadcrumbList } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Chocolate Fountain Rentals',
  description: "Vancouver Island's largest chocolate fountain supplier: premium Lindt chocolate fountains for events from 20 to 1,000 guests in Victoria, BC.",
  openGraph: {
    url: '/fountains',
    siteName: 'Melting Moments Catering',
    locale: 'en_CA',
    type: 'website',
    images: [{ url: '/og/og-about.jpg', width: 1200, height: 630, alt: 'Copper pots hanging above the range in the Melting Moments kitchen' }],
  },
}

export const revalidate = 300;

const fountainService = {
  '@type': 'Service',
  '@id': `${SITE.url}/fountains#service`,
  name: 'Chocolate Fountain Rentals',
  serviceType: 'Chocolate fountain rental',
  description:
    "Vancouver Island's largest chocolate fountain supplier: premium Lindt chocolate fountains for events from 20 to 1,000 guests in Victoria, BC.",
  url: `${SITE.url}/fountains`,
  provider: { '@id': BUSINESS_ID },
  areaServed: AREA_SERVED,
};

export default function Fountains() {
  return (
    <div>
      <JsonLd data={fountainService} />
      <JsonLd data={breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Chocolate Fountain Rentals', path: '/fountains' }])} />
      <header className="container page-header-grid" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1.2fr', gap: '3rem', alignItems: 'center' }}>
        <div>
          <div className="menu-index" style={{ marginBottom: '2rem' }}>Fountains</div>
          <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}>
            CHOCOLATE <br /> CASCADES
          </h1>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '40ch', marginTop: '1.5rem', lineHeight: 1.6 }}>
            The largest supplier of chocolate fountains on Vancouver Island. Fountains suit any event, from 20 to 1,000 guests, with premium Lindt chocolate cascading warm over every tier.
          </p>
        </div>
        <div className="shape-editorial-tall" style={{ width: '100%', position: 'relative', aspectRatio: '4/5' }}>
          <Image src="/copper_pots.webp" alt="Copper pots above the range in our kitchen" fill sizes="100vw" style={{ objectFit: 'cover' }} priority />
        </div>
      </header>

      <section className="container" style={{ paddingTop: 'clamp(2rem, 4vw, 4rem)', paddingBottom: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4rem' }}>
          <h2 className="noire-serif">Chocolate Fountains</h2>
          <span className="menu-index">SIZES</span>
        </div>
        
        <div className="pricing-grid">
            <div className="pricing-card">
                <div className="menu-index" style={{ marginBottom: '1rem' }}>XL: 30 LBS</div>
                <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '1rem' }}>Extra Large Fountain</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, marginBottom: '2rem' }}>Good for groups over 250 guests, or for those extreme chocolate lovers!</p>
                <div className="menu-price" style={{ fontSize: '1.5rem' }}>$750</div>
            </div>
            
            <div className="pricing-card">
                <div className="menu-index" style={{ marginBottom: '1rem' }}>L: 20 LBS</div>
                <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '1rem' }}>Large Fountain</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, marginBottom: '2rem' }}>Served with 20 lbs of chocolate. Serves up to 250 guests.</p>
                <div className="menu-price" style={{ fontSize: '1.5rem' }}>$550</div>
            </div>

            <div className="pricing-card">
                <div className="menu-index" style={{ marginBottom: '1rem' }}>S: 10 LBS</div>
                <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '1rem' }}>Small Fountain</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, marginBottom: '2rem' }}>Serves up to 125 guests.</p>
                <div className="menu-price" style={{ fontSize: '1.5rem' }}>$350</div>
            </div>

            <div className="pricing-card">
                <div className="menu-index" style={{ marginBottom: '1rem' }}>XS: 5 LBS</div>
                <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '1rem' }}>Mini Fountain</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, marginBottom: '2rem' }}>Serves up to 30 guests.</p>
                <div className="menu-price" style={{ fontSize: '1.5rem' }}>$150</div>
            </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', marginTop: '6rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '4rem' }}>
          <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Dipping Goodies</h2>
        </div>
        <div style={{ padding: '2rem', backgroundColor: 'var(--clr-ink)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ maxWidth: '50ch', lineHeight: 1.6, opacity: 0.8 }}>Strawberries, pineapples, cantaloupe, marshmallows, graham crackers, angel food cake, pound cake, chocolate chip cookies, sugar and shortbread cookies, Oreo cookies, cream puffs, Rice Krispies, and lady fingers.</p>
            <div className="menu-price" style={{ color: 'white', fontSize: '1.5rem' }}>$5.50<span style={{ fontSize: '0.8rem', opacity: 0.5 }}> / PP</span></div>
        </div>
        <p style={{ fontSize: 'var(--text-body)', opacity: 0.5, marginTop: '1.5rem', lineHeight: 1.6 }}>All rentals include 4 hours of enjoyment, skewers, napkins. Delivery fees apply within the Victoria area. Delivery is $30 per trip. Lindt chocolate in milk or dark. White chocolate and other colours available upon request.</p>
      </section>

      <section className="container" style={{ paddingBottom: '10rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '4rem' }}>
          <h2 className="noire-serif">Champagne Fountain</h2>
        </div>
        <p style={{ marginBottom: '4rem', opacity: 0.6, maxWidth: '50ch', lineHeight: 1.6 }}>Create lasting memories with an elegant Champagne fountain which provides the ambiance of a cascading waterfall complete with lights. The fountain may be embellished with fresh flowers nestled in the crown.</p>

        {/* The empty first cell keeps the 3-column grid aligned; the package
            names carry their own Gold/Silver/Bronze labels. */}
        <div className="menu-grid-constraint"><div aria-hidden="true" /><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Gold Package</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Includes a Melting Moments attendant, fresh flower display, a platter of fresh strawberries, fluted glasses and seven litres of your preferred non-alcoholic beverage. (Our specialty is a fruit punch). Serves up to 100.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$549</div></div>
        <div className="menu-grid-constraint"><div aria-hidden="true" /><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Silver Package</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Includes a fresh flower display and a platter of fresh strawberries for your champagne glass.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$349</div></div>
        <div className="menu-grid-constraint"><div aria-hidden="true" /><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bronze Package</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Champagne Fountain delivery and pick up service only. The fountain is simple to operate.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$199</div></div>
      </section>

    </div>
  );
}
