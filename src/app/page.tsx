import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getCmsContent, getTestimonials } from '@/lib/cms';
import { GuidosCrest } from '@/components/guidos/GuidosWordmark';

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Melting Moments & Guido's Gourmet | Catering, Victoria BC",
  description: 'Bespoke catering and homemade Italian ready-made meals by Chef Paul Silletta in Victoria, BC. Weddings, events, and meal delivery.',
};

const SERVICES = [
  { href: '/weddings', name: 'Weddings', line: 'Bespoke menus and full-service catering for your day.' },
  { href: '/events', name: 'Events', line: 'Corporate functions, private celebrations and dinners on the water, fully staffed.' },
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
          HERO: Split brand names with vertical separator
          ================================================ */}
      <header className="hero-dark" style={{ width: '100%', minHeight: '100dvh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Image src="/hero-main.webp" alt="Editorial Italian cuisine plating" fill sizes="100vw" style={{ objectFit: 'cover' }} priority />

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.55) 100%)' }}></div>

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%', padding: '6rem 2rem' }}>
          {/* Each brand name is the way into its own side of the site; the
              nav stays hidden over the hero, so these are the only way in from
              the top. Pointing at a name brings in that brand's own mark, and
              the line beneath switches to that brand's voice. */}
          <div className="hero-brand-lockup">
            <Link href="/catering" className="hero-brand-link hero-brand-link--mm" aria-label="Melting Moments catering: weddings and events">
              <span className="hero-brand-mark hero-brand-mark--mm" aria-hidden="true">
                <Image src="/apple-touch-icon.png" alt="" width={72} height={72} />
              </span>
              <h1 className="haus-display hero-brand-name" aria-label="Melting Moments" style={{ color: 'white', textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}>
                Melting<br />Moments
              </h1>
              <span className="hero-brand-note"><span className="hero-brand-note__text">Weddings and events<span className="hero-brand-arrow" aria-hidden="true">→</span></span></span>
            </Link>
            <div className="hero-separator" aria-hidden="true"></div>
            <Link href="/guidos" className="hero-brand-link hero-brand-link--guidos" aria-label="Guido's Gourmet: ready-made meals">
              <span className="hero-brand-mark hero-brand-mark--guidos" aria-hidden="true">
                <GuidosCrest tone="ink" size={58} />
              </span>
              <span className="haus-display hero-brand-name" style={{ color: 'white', textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}>
                Guido&apos;s<br />Gourmet
              </span>
              <span className="hero-brand-note"><span className="hero-brand-note__text">Ready-made meals<span className="hero-brand-arrow" aria-hidden="true">→</span></span></span>
            </Link>
          </div>
          {/* All three lines share one grid cell, so swapping between them
              never moves the button below. The two brand lines are taglines
              that only show while a name is pointed at, so only the shared
              line is read aloud. */}
          <div className="hero-voice">
            <p className="hero-voice__line hero-voice__line--both">
              Both from Chef Paul Silletta&apos;s kitchen in Victoria, BC.
            </p>
            <p className="hero-voice__line hero-voice__line--mm" aria-hidden="true">
              Catering, made by hand.
            </p>
            <p className="hero-voice__line hero-voice__line--guidos" aria-hidden="true">
              When your hunger speaks Italian!
            </p>
          </div>
          <Link href="/contact" className="btn-bone" style={{ marginTop: '2rem' }}>
            Get a Quote
          </Link>
        </div>
      </header>

      {/* ================================================
          WHAT WE CATER
          ================================================ */}
      <section className="container" style={{ paddingTop: 'clamp(4rem, 8vw, 8rem)', paddingBottom: 'clamp(4rem, 8vw, 7rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>What We Cater</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem 3rem', borderTop: '1px solid rgba(0,0,0,0.12)', paddingTop: '3rem' }}>
          {SERVICES.map((s, i) => (
            <Link key={s.href} href={s.href} className="service-link" style={{ textDecoration: 'none', color: 'var(--clr-ink)', display: 'block' }}>
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
                    <div role="img" aria-label={`${rev.rating} out of 5 stars`} style={{ color: '#E2C992', fontSize: '1.1rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>{'★'.repeat(rev.rating)}</div>
                  ) : null}
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontStyle: 'italic', color: 'var(--clr-oat)', lineHeight: 1.4, marginBottom: '1.5rem' }}>&ldquo;{rev.text}&rdquo;</p>
                  <div className="menu-index" style={{ color: 'var(--clr-bone)', opacity: 0.8 }}>{rev.author}</div>
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
          <Link href="/contact" className="btn-outline btn-outline--inverse">{ctaButton}</Link>
        </div>
      </section>
    </div>
  );
}
