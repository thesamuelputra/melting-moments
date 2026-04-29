import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guido\'s Gourmet | Ready-Made Italian Meals Victoria BC',
  description: 'Homemade Italian meals ready to heat and serve. Lasagnes, pot pies, soups, pasta, and desserts. Delivery available in Victoria, BC.',
};

const featuredProducts = [
  { name: 'Beef Bolognese Lasagne', price: 'From $27', image: '/guidos/beef-bolognese-lasagne.webp' },
  { name: 'Tiramisu Cans', price: 'From $9.95', image: '/guidos/tiramisu-cans.webp' },
  { name: 'Turkey Pot Pie', price: '$9', image: '/guidos/turkey-pot-pie.webp' },
];

export default function GuidosPage() {
  return (
    <div>
      {/* Hero */}
      <section className="container" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>Est. 2009</div>
        <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 8vw, 8rem)', marginBottom: '3rem' }}>
          Guido&apos;s<br />Gourmet
        </h1>
        <div className="shape-editorial-tall" style={{ position: 'relative', width: '100%', maxWidth: '900px' }}>
          <Image
            src="/guidos/guidos-hero.webp"
            alt="Italian ready-made meals"
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            style={{ objectFit: 'cover', backgroundColor: 'var(--clr-charcoal)' }}
            priority
          />
        </div>
      </section>

      {/* Our Roots */}
      <section className="container spacer-massive" style={{ textAlign: 'center', maxWidth: '700px' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>01 · Our Roots</div>
        <p className="noire-serif" style={{ fontSize: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '2rem' }}>
          We started in a family kitchen. Sixteen years later, the recipes are the same. The portions are bigger.
        </p>
        <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, maxWidth: '50ch', margin: '0 auto' }}>
          Good food at a fair price. Shop online or visit by appointment. Everything is made fresh by Chef Paul Silletta using traditional Italian recipes passed down through generations.
        </p>
      </section>

      {/* Divider */}
      <div className="spacer-large" style={{ textAlign: 'center' }}>
        <div className="noire-divider"></div>
      </div>

      {/* Featured Products */}
      <section className="container spacer-massive">
        <div className="menu-index" style={{ marginBottom: '2rem' }}>02 · Featured</div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <Link href="/guidos/menu" key={product.name} className="product-card">
              <div className="product-card__image">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-body)', fontWeight: 400, marginBottom: '0.25rem' }}>
                {product.name}
              </h3>
              <span style={{ fontSize: 'var(--text-micro)', letterSpacing: '0.1em', opacity: 0.5 }}>
                {product.price}
              </span>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 'clamp(2rem, 4vw, 4rem)' }}>
          <Link href="/guidos/menu" className="btn-outline">View Full Menu</Link>
        </div>
      </section>

      {/* Delivery Info */}
      <section className="haus-block-container spacer-massive">
        <div className="container" style={{ textAlign: 'center', maxWidth: '700px' }}>
          <div className="menu-index" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>03 · Delivery</div>
          <h2 className="noire-serif" style={{ color: 'white', marginBottom: '1.5rem' }}>
            Flat rate: $12.50 anywhere in Victoria.
          </h2>
          <p style={{ opacity: 0.5, marginBottom: '0.5rem', color: 'white' }}>Pickup by appointment.</p>
          <p style={{ opacity: 0.5, marginBottom: '2.5rem', color: 'white' }}>614 Grenville Ave, Esquimalt.</p>
          <Link href="/guidos/order" className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', display: 'inline-block' }}>
            Order Now
          </Link>
        </div>
      </section>

      {/* Cross-sell */}
      <section className="container" style={{ padding: 'clamp(2rem, 4vw, 3rem) 0', textAlign: 'center' }}>
        <span className="menu-index">
          Planning an event? <Link href="/menus" style={{ textDecoration: 'underline' }}>Melting Moments Catering →</Link>
        </span>
      </section>
    </div>
  );
}
