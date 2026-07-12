import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getTestimonials } from '@/lib/cms';
import { JsonLd, breadcrumbList } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Catering Services',
  description:
    'Catering for weddings, corporate events and private dining across Vancouver Island. Chef Paul Silletta — 17 years, family recipes, in your kitchen on the day.',
  openGraph: {
    description:
      'Weddings, corporate, private & yacht dining, family style and chocolate fountains — catered across Vancouver Island by Chef Paul Silletta.',
    images: [{ url: '/og/og-default.jpg', width: 1200, height: 630, alt: 'Melting Moments Catering' }],
    url: '/catering',
    siteName: 'Melting Moments Catering',
    locale: 'en_CA',
    type: 'website',
  },
};

const offerings = [
  {
    name: 'Weddings',
    href: '/weddings',
    image: '/wedding_entree.webp',
    line: 'A menu built around your day, plated and served by people who care how it lands.',
  },
  {
    name: 'Corporate',
    href: '/corporate',
    image: '/hero-main.webp',
    line: 'Galas, launches and lunches — punctual, polished and easy to hand off.',
  },
  {
    name: 'Private & Yacht Dining',
    href: '/private-events',
    image: '/private_dinner.webp',
    line: 'Intimate dinners at home or on the water, cooked to order on site.',
  },
  {
    name: 'Family Style',
    href: '/family-style',
    image: '/macro_roulade.webp',
    line: 'Generous platters passed around the table, the way good food is meant to be shared.',
  },
  {
    name: 'Chocolate Fountains',
    href: '/fountains',
    image: '/copper_pots.webp',
    line: 'A warm, flowing centrepiece — premium chocolate, set up and tended for you.',
  },
];

export default async function Catering() {
  const rawReviews = await getTestimonials().catch(() => []);
  const reviews = rawReviews.slice(0, 2);

  return (
    <div>
      <JsonLd data={breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Catering Services', path: '/catering' }])} />
      {/* 1. HERO */}
      <header
        className="container"
        style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)' }}
      >
        <div className="menu-index" style={{ marginBottom: '2rem' }}>Melting Moments</div>
        <h1 className="haus-display" style={{ textTransform: 'uppercase' }}>Catering</h1>
        <div className="spacer-large">
          <div className="noire-divider"></div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            marginTop: '4rem',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 className="noire-serif" style={{ marginBottom: '2rem' }}>
              Catering, made by hand.
            </h2>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, marginBottom: '1.5rem', lineHeight: 1.7 }}>
              We cater weddings, corporate events and private dining across Vancouver Island — built
              around real food, real recipes, and the people at the table. Chef Paul Silletta has
              been cooking in Victoria for 17 years, and he is the one who shows up in your kitchen
              on the day.
            </p>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, marginBottom: '2rem', lineHeight: 1.7 }}>
              From a 20-guest dinner at home to a 300-guest gala, every menu starts as a
              conversation and ends with a plate worth talking about.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link href="/contact" className="btn-solid">Get a Quote</Link>
              <Link href="/menus" className="btn-outline">View Menus</Link>
            </div>
          </div>
          <div className="shape-editorial-tall" style={{ position: 'relative', width: '100%' }}>
            <Image
              src="/catering_menu_hero.webp"
              alt="Plated catering dish by Chef Paul Silletta"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </header>

      {/* 2. WHAT WE CATER */}
      <section className="container spacer-massive">
        <div className="menu-index" style={{ marginBottom: '2rem' }}>What We Cater</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            marginTop: '3rem',
          }}
        >
          {offerings.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="shape-editorial-tall"
                style={{ position: 'relative', width: '100%', marginBottom: '1.25rem' }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'var(--text-secondary)',
                  fontWeight: 400,
                  marginBottom: '0.5rem',
                }}
              >
                {item.name}
              </h3>
              <p style={{ fontSize: 'var(--text-body)', opacity: 0.7, lineHeight: 1.6 }}>
                {item.line}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. SOCIAL PROOF */}
      {reviews.length > 0 && (
        <section className="container spacer-massive">
          <div className="menu-index" style={{ marginBottom: '2rem' }}>In Their Words</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginTop: '3rem',
            }}
          >
            {reviews.map((rev, i) => (
              <div key={i} className="haus-block-container" style={{ padding: '3rem' }}>
                {rev.rating && (
                  <div
                    role="img"
                    aria-label={`${rev.rating} out of 5 stars`}
                    style={{
                      color: '#E2C992',
                      fontSize: '1.1rem',
                      marginBottom: '1.5rem',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {'★'.repeat(rev.rating)}
                  </div>
                )}
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    lineHeight: 1.4,
                    marginBottom: '2rem',
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;{rev.text}&rdquo;
                </p>
                <div>
                  <div className="menu-index" style={{ color: 'var(--clr-bone)', opacity: 0.8 }}>
                    — {rev.author}
                  </div>
                  {rev.role && (
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'rgba(255,255,255,0.55)',
                        marginTop: '0.25rem',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {rev.role}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. CLOSING CTA */}
      <section className="haus-block-container spacer-massive">
        <div className="container" style={{ textAlign: 'center', maxWidth: '700px' }}>
          <div className="menu-index" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>
            Let&apos;s Talk
          </div>
          <h2 className="noire-serif" style={{ color: 'var(--clr-oat)', marginBottom: '1.5rem' }}>
            Tell us about your event.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Chef Paul personally replies within one business day.
          </p>
          <Link href="/contact" className="btn-solid btn-solid--inverse">Get a Quote</Link>
        </div>
      </section>
    </div>
  );
}
