import { Metadata } from 'next';
import Image from 'next/image';
import { AREA_SERVED, BUSINESS_ID, JsonLd, SITE, breadcrumbList } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Family-Style Catering',
  description: 'Big shared platters passed around the table, the way an Italian family eats at home. Family-style catering in Victoria, BC.',
  openGraph: {
    url: '/family-style',
    siteName: 'Melting Moments Catering',
    locale: 'en_CA',
    type: 'website',
    description: 'Big shared platters passed around the table, the way an Italian family eats at home.',
    images: [{ url: '/og/og-family-style.jpg', width: 1200, height: 630, alt: 'Sliced pork roulade plated to share' }],
  },
}

export const revalidate = 300;

const familyStyleService = {
  '@type': 'Service',
  '@id': `${SITE.url}/family-style#service`,
  name: 'Family-Style Catering',
  serviceType: 'Family-style catering',
  description:
    'Big shared platters passed around the table, the way an Italian family eats at home. Family-style catering in Victoria, BC.',
  url: `${SITE.url}/family-style`,
  provider: { '@id': BUSINESS_ID },
  areaServed: AREA_SERVED,
};

export default function FamilyStyle() {
  return (
    <div>
      <JsonLd data={familyStyleService} />
      <JsonLd data={breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Family-Style Catering', path: '/family-style' }])} />
      <header className="container" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(1rem, 2vw, 2rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>Family Style Service</div>
        <h1 className="haus-display" style={{ marginBottom: '4rem' }}>
          GATHERED <br /> AT THE TABLE
        </h1>
        <div className="shape-editorial-tall" style={{ width: '100%', position: 'relative', aspectRatio: '16/9', marginBottom: '4rem' }}>
          <Image src="/macro_roulade.webp" alt="Sliced pork roulade plated to share" fill sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
      </header>

      <section className="container" style={{ paddingTop: 'clamp(2rem, 4vw, 4rem)', paddingBottom: '8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4rem' }}>
          <h2 className="noire-serif">Peasano Dinner</h2>
          <span className="menu-index">ITALIAN</span>
        </div>
        <p style={{ marginBottom: '3rem', opacity: 0.6, maxWidth: '50ch', lineHeight: 1.6 }}>A Traditional Italian Meal. This is commonly served in any Italian home.</p>

        {/* Per-row numbering removed — the section header carries the single
            index marker. Spacers keep the 3-column grid aligned. */}
        <div className="menu-grid-constraint">
          <div aria-hidden="true" />
          <div>
            <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Antipasto Platter</h3>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Sliced Prosciutto, Calabrese Salami, Cheese, Black and Green Olives, Pearl Onions, Baby Dills, Cantaloupe and Artichoke Quarters</p>
          </div>
        </div>

        <div className="menu-grid-constraint"><div aria-hidden="true" /><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pasta Di Casa</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Assorted Pasta Styles with Homemade Sauce</p></div></div>
        <div className="menu-grid-constraint"><div aria-hidden="true" /><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Insalata</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Fresh Arugula tossed with Olive Oil, Vinegar and Fresh Herbs</p></div></div>
        <div className="menu-grid-constraint"><div aria-hidden="true" /><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Carne</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Roasted Chicken or Veal or Chicken Parmesan, Pan Fried and Topped with Tomato Sauce. (Optional add on Salmon or Beef Strip loin Add $2 per person)</p></div></div>
        <div className="menu-grid-constraint"><div aria-hidden="true" /><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Patate</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Roasted Potatoes with Fresh Herbs</p></div></div>
        <div className="menu-grid-constraint"><div aria-hidden="true" /><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Vegetali</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>An Array of Fresh Roasted Vegetables</p></div></div>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '4rem', padding: '2rem', border: '1px solid rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="noire-serif" style={{ fontSize: '1.5rem' }}>One Carne Option</span>
                <span className="menu-price">$33.50 PP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="noire-serif" style={{ fontSize: '1.5rem' }}>Two Meat Options</span>
                <span className="menu-price">$36.50 PP</span>
            </div>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '1rem' }}>Use of plate charge required for this option. On average $3 per serving.</p>
        </div>
      </section>
    </div>
  );
}
