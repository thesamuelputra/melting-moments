import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getCmsContent } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Melting Moments & Guido\'s Gourmet | Italian Catering & Ready-Made Meals Victoria BC',
  description: 'Bespoke catering and homemade Italian ready-made meals by Chef Paul Silletta in Victoria, BC. Weddings, corporate events, private dining, and meal delivery.',
};

export default async function Home() {
  const cms = await getCmsContent();

  const ctaHeading = cms('home_cta_heading', 'Whatever the occasion, we make it count.');
  const ctaBody = cms('home_cta_body', 'From a 200-guest wedding to Tuesday night dinner.');
  const ctaButton = cms('home_cta_button', 'Get in Touch');

  return (
    <div>
      {/* ================================================
          HERO — Split brand names with vertical separator
          ================================================ */}
      <header style={{ width: '100%', height: '100dvh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Image src="/hero-main.webp" alt="Editorial Italian cuisine plating" fill sizes="100vw" style={{ objectFit: 'cover' }} priority />
        
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 100%)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%', padding: '0 2rem' }}>
          {/* Desktop: side by side. Mobile: stacked */}
          <div className="hero-brand-lockup">
            <h1 className="haus-display hero-brand-name" style={{ color: 'white', textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}>
              Melting<br />Moments
            </h1>
            <div className="hero-separator" aria-hidden="true"></div>
            <span className="haus-display hero-brand-name" style={{ color: 'white', textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}>
              Guido&apos;s<br />Gourmet
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-micro)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '2rem' }}>
            Italian Catering & Ready-Made Meals · Victoria, BC
          </p>
        </div>
        
        <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3, opacity: 0.6, animation: 'pulse 2s infinite' }}>
            <span style={{ color: 'white', fontSize: 'var(--text-micro)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>↓ Scroll</span>
        </div>
      </header>

      {/* ================================================
          CHOOSER — Two editorial cards
          ================================================ */}
      <section className="container" style={{ paddingTop: 'clamp(4rem, 8vw, 8rem)', paddingBottom: 'clamp(4rem, 8vw, 8rem)' }}>
        <div className="chooser-grid">
          {/* Catering Card */}
          <Link href="/menus" className="chooser-card">
            <div className="chooser-card__image">
              <Image src="/copper_pots.webp" alt="Copper pots hanging in professional kitchen" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
            </div>
            <div className="chooser-card__content">
              <div className="menu-index" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>01 · Catering</div>
              <h2 className="noire-serif" style={{ color: 'white', marginBottom: '1rem', fontSize: 'var(--text-secondary)' }}>Melting Moments Catering</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-body)', maxWidth: '35ch', marginBottom: '2rem' }}>
                Weddings, corporate events, and private dining across Vancouver Island.
              </p>
              <span className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>View Services</span>
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
              <span className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>See the Menu</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ================================================
          SHARED CTA
          ================================================ */}
      <section className="haus-block-container" style={{ marginTop: 'clamp(0rem, 2vw, 2rem)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div className="menu-index" style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.5)' }}>03 · Chef Paul Silletta</div>
          <h2 className="noire-serif" style={{ color: 'white', marginBottom: '1.5rem' }}>
            {ctaHeading}
          </h2>
          <p style={{ fontSize: 'var(--text-body)', maxWidth: '45ch', opacity: 0.6, color: 'white', margin: '0 auto 2.5rem auto' }}>
            {ctaBody}
          </p>
          <Link href="/contact" className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', display: 'inline-block' }}>{ctaButton}</Link>
        </div>
      </section>
    </div>
  );
}
