import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getCmsContent, getTestimonials } from '@/lib/cms';

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Melting Moments & Guido's Gourmet | Catering, Victoria BC",
  description: 'Bespoke catering and homemade Italian ready-made meals by Chef Paul Silletta in Victoria, BC. Weddings, corporate events, private dining, and meal delivery.',
};

const SERVICES = [
  { href: '/weddings', name: 'Weddings', line: 'Bespoke menus and full-service catering for your day.' },
  { href: '/corporate', name: 'Corporate', line: 'Galas, conferences and office gatherings, handled.' },
  { href: '/private-events', name: 'Private & Yacht', line: 'Intimate dinners and on-board dining, fully staffed.' },
  { href: '/family-style', name: 'Family Style', line: 'Generous shared platters for relaxed celebrations.' },
  { href: '/fountains', name: 'Chocolate Fountains', line: "Vancouver Island's largest fountain rental service." },
];

export default async function Home() {
  const [cms, rawReviews] = await Promise.all([
    getCmsContent(),
    getTestimonials().catch(() => []),
  ]);
  const reviews = rawReviews.slice(0, 2);

  const ctaHeading = cms('home_cta_heading', 'Whatever the occasion, we make it count.');
  const ctaBody = cms('home_cta_body', 'From a 200-guest wedding to Tuesday night dinner.');
  const ctaButton = cms('home_cta_button', 'Get a Quote');

  return (
    <div>
      {/* ================================================
          HERO — Split brand names with vertical separator
          ================================================ */}
      <header style={{ width: '100%', height: '100dvh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Image src="/hero-main.webp" alt="Editorial Italian cuisine plating" fill sizes="100vw" style={{ objectFit: 'cover' }} priority />

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.55) 100%)' }}></div>

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%', padding: '0 2rem' }}>
          <div className="hero-brand-lockup">
            <h1 className="haus-display hero-brand-name" aria-label="Melting Moments" style={{ color: 'white', textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}>
              Melting<br />Moments
            </h1>
            <div className="hero-separator" aria-hidden="true"></div>
            <span className="haus-display hero-brand-name" style={{ color: 'white', textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}>
              Guido&apos;s<br />Gourmet
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 'var(--text-body)', maxWidth: '46ch', margin: '2rem auto 0 auto', lineHeight: 1.6 }}>
            Catering for weddings, events and private dining across Vancouver Island — plus Guido&apos;s ready-made Italian, at home.
          </p>
          <Link href="/contact" style={{ display: 'inline-block', marginTop: '2.25rem', background: 'var(--clr-bone)', color: 'var(--clr-ink)', padding: '0.9rem 2.25rem', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 500 }}>
            Get a Quote
          </Link>
        </div>

        <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3, opacity: 0.6, animation: 'pulse 2s infinite' }}>
            <span style={{ color: 'white', fontSize: 'var(--text-micro)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>↓ Scroll</span>
        </div>
      </header>

      {/* ================================================
          CHOOSER — Two editorial cards
          ================================================ */}
      <section className="container" style={{ paddingTop: 'clamp(4rem, 8vw, 8rem)', paddingBottom: 'clamp(3rem, 6vw, 6rem)' }}>
        <div className="chooser-grid">
          {/* Catering Card */}
          <Link href="/catering" className="chooser-card">
            <div className="chooser-card__image">
              <Image src="/copper_pots.webp" alt="Copper pots hanging in professional kitchen" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
            </div>
            <div className="chooser-card__content">
              <div className="menu-index" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>01 · Catering</div>
              <h2 className="noire-serif" style={{ color: 'white', marginBottom: '1rem', fontSize: 'var(--text-secondary)' }}>Melting Moments Catering</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-body)', maxWidth: '35ch', marginBottom: '2rem' }}>
                Weddings, corporate events, and private dining across Vancouver Island.
              </p>
              <span className="btn-outline btn-outline--inverse" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>Explore Catering</span>
            </div>
          </Link>

          {/* Guido's Card */}
          <Link href="/guidos" className="chooser-card">
            <div className="chooser-card__image">
              <Image src="/macro_roulade.webp" alt="Italian ready-made meal" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
            </div>
            <div className="chooser-card__content">
              <div className="menu-index" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>02 · Ready-Made Meals</div>
              <h2 className="noire-serif" style={{ color: 'white', marginBottom: '1rem', fontSize: 'var(--text-secondary)' }}>Guido&apos;s Gourmet</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-body)', maxWidth: '35ch', marginBottom: '2rem' }}>
                Homemade Italian meals, ready to heat and serve. Delivery available in Victoria.
              </p>
              <span className="btn-outline btn-outline--inverse" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>See the Menu</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ================================================
          WHAT WE CATER
          ================================================ */}
      <section className="container" style={{ paddingBottom: 'clamp(4rem, 8vw, 7rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2.5rem' }}>What We Cater</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem 3rem', borderTop: '1px solid rgba(0,0,0,0.12)', paddingTop: '3rem' }}>
          {SERVICES.map((s, i) => (
            <Link key={s.href} href={s.href} style={{ textDecoration: 'none', color: 'var(--clr-ink)', display: 'block' }}>
              <div className="menu-index" style={{ opacity: 0.4, marginBottom: '0.75rem' }}>{String(i + 1).padStart(2, '0')}</div>
              <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.6rem' }}>{s.name}</h3>
              <p style={{ fontSize: '0.95rem', opacity: 0.65, lineHeight: 1.55, maxWidth: '30ch' }}>{s.line}</p>
              <span style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '1px solid currentColor', paddingBottom: '2px' }}>Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================
          SOCIAL PROOF
          ================================================ */}
      {reviews.length > 0 && (
        <section className="haus-block-container">
          <div className="container">
            <div className="menu-index" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>Kind Words</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
              {reviews.map((rev, i) => (
                <div key={i}>
                  {rev.rating ? (
                    <div role="img" aria-label={`${rev.rating} out of 5 stars`} style={{ color: '#E2C992', marginBottom: '1rem', letterSpacing: '0.1em' }}>{'★'.repeat(rev.rating)}</div>
                  ) : null}
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontStyle: 'italic', color: 'var(--clr-oat)', lineHeight: 1.4, marginBottom: '1.5rem' }}>&ldquo;{rev.text}&rdquo;</p>
                  <div className="menu-index" style={{ color: 'var(--clr-bone)', opacity: 0.8 }}>— {rev.author}</div>
                  {rev.role ? <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.25rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{rev.role}</div> : null}
                </div>
              ))}
            </div>
            <p style={{ marginTop: '3rem', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
              Chef Paul Silletta · 17 years · Vancouver Island
            </p>
          </div>
        </section>
      )}

      {/* ================================================
          SHARED CTA
          ================================================ */}
      <section className="haus-block-container" style={{ marginTop: 'clamp(0rem, 2vw, 2rem)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div className="menu-index" style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.5)' }}>Get Started</div>
          <h2 className="noire-serif" style={{ color: 'white', marginBottom: '1.5rem' }}>
            {ctaHeading}
          </h2>
          <p style={{ fontSize: 'var(--text-body)', maxWidth: '45ch', opacity: 0.6, color: 'white', margin: '0 auto 1rem auto' }}>
            {ctaBody}
          </p>
          <p style={{ fontSize: '0.8rem', opacity: 0.45, color: 'white', margin: '0 auto 2.5rem auto' }}>
            Chef Paul personally replies within one business day.
          </p>
          <Link href="/contact" className="btn-outline btn-outline--inverse" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', display: 'inline-block' }}>{ctaButton}</Link>
        </div>
      </section>
    </div>
  );
}
