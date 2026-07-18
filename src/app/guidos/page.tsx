import Link from 'next/link';
import GuidosImage from '@/components/GuidosImage';
import GuidosWordmark from '@/components/guidos/GuidosWordmark';
import GuidosOrnament from '@/components/guidos/GuidosOrnament';
import type { Metadata } from 'next';
import { JsonLd, breadcrumbList } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = {
  // Guido's carries its own brand, so bypass the Melting Moments title template.
  title: { absolute: "Guido's Gourmet | Ready-Made Italian Meals, Victoria BC" },
  description: 'Homemade Italian meals ready to heat and serve. Lasagnes, pot pies, soups, pasta, and desserts. Delivery available in Victoria, BC.',
  openGraph: {
    url: '/guidos',
    siteName: "Guido's Gourmet",
    locale: 'en_CA',
    type: 'website',
    images: [{ url: '/og/og-default.jpg', width: 1200, height: 630, alt: "Guido's Gourmet by Melting Moments Catering" }],
  },
};

const featuredProducts = [
  { name: 'Beef Bolognese Lasagne', price: 'From $27', image: '/guidos/beef-bolognese-lasagne.webp' },
  { name: 'Tiramisu Cans', price: 'From $9.95', image: '/guidos/tiramisu-cans.webp' },
  { name: 'Turkey Pot Pie', price: '$9', image: '/guidos/turkey-pot-pie.webp' },
];

export default function GuidosPage() {
  return (
    <div>
      <JsonLd data={breadcrumbList([{ name: 'Home', path: '/' }, { name: "Guido's Gourmet", path: '/guidos' }])} />

      {/* Hero: the brand lockup, spoken plainly on cream paper */}
      <section className="container" style={{ paddingTop: 'calc(80px + 4vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)', textAlign: 'center' }}>
        <div className="g-eyebrow" style={{ marginBottom: '2rem' }}>Est. 2009 &middot; Victoria BC</div>
        <GuidosWordmark tagline="When your hunger speaks Italian!" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1.75rem', fontSize: 'var(--text-body)', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--g-ink-soft)', fontWeight: 500 }}>
          Italian Heritage &middot; Ready-Made Meals
        </p>
      </section>

      {/* Hero image, with the packaging tricolour capping it */}
      <section className="container" style={{ marginTop: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(18,63,46,0.10)' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
            {/* The tricolour caps the image (as it caps every package), so all
                three stripes sit on the photo and read as one flag */}
            <span className="g-tricolor" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }} />
            <GuidosImage
              src="/guidos/guidos-hero.webp"
              alt="Italian ready-made meals by Guido's Gourmet"
              fill
              sizes="(max-width: 768px) 100vw, 1000px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* Our roots */}
      <section className="container spacer-massive" style={{ textAlign: 'center', maxWidth: '720px' }}>
        <div className="g-eyebrow" style={{ marginBottom: '1.5rem' }}>01 &middot; Our Roots</div>
        <p className="noire-serif" style={{ fontSize: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '1.75rem' }}>
          We started in a family kitchen. Seventeen years later, the recipes are the same. The portions are bigger.
        </p>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--g-ink-soft)', maxWidth: '52ch', margin: '0 auto 1.5rem' }}>
          Good food at a fair price. Order online or visit by appointment. Everything is made fresh by Chef Paul Silletta using traditional Italian recipes passed down through generations.
        </p>
        <p className="g-script g-script--sm">Chef crafted. Handmade. Made with love.</p>
      </section>

      <div className="spacer-large">
        <GuidosOrnament />
      </div>

      {/* Featured */}
      <section className="container spacer-massive">
        <div className="g-eyebrow" style={{ marginBottom: '2rem' }}>02 &middot; Featured</div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <Link href="/guidos/menu" key={product.name} className="g-card">
              <div className="g-card__media">
                <GuidosImage
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="g-card__body">
                <span className="g-card__name">{product.name}</span>
                <span className="g-card__price">{product.price}</span>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 'clamp(2.5rem, 5vw, 4rem)' }}>
          <Link href="/guidos/menu" className="btn-outline">View Full Menu</Link>
        </div>
      </section>

      {/* Delivery, on the deep-green block */}
      <section className="g-block spacer-massive">
        <div className="container" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <div className="g-eyebrow" style={{ marginBottom: '1.5rem' }}>03 &middot; Delivery</div>
          <h2 className="noire-serif" style={{ marginBottom: '1.5rem' }}>
            Flat rate: $12.50 anywhere in Victoria.
          </h2>
          <p style={{ opacity: 0.75, marginBottom: '0.4rem' }}>Pickup by appointment.</p>
          <p style={{ opacity: 0.75, marginBottom: '1.75rem' }}>614 Grenville Ave, Esquimalt.</p>
          <p className="g-script" style={{ marginBottom: '2.25rem' }}>Quando la fame parla, parla Italiano!</p>
          <Link href="/guidos/order" className="btn-outline btn-outline--inverse">
            Order Now
          </Link>
        </div>
      </section>
    </div>
  );
}
