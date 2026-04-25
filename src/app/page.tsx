import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
    <div>
      {/* AWARD WINNING FULL BLEED HERO */}
      <header style={{ width: '100%', height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Image src="/hero-main.jpg" alt="Michelin Star Lasagna Plating" fill sizes="100vw" style={{ objectFit: 'cover' }} priority />
        
        {/* Subtle, localized gradient behind text */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 100%)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%', padding: '0 2rem' }}>
          <h1 className="haus-display" style={{ color: 'white', textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}>
            MELTING<br />MOMENTS
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-micro)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '2rem' }}>
            Bespoke Catering · Victoria BC
          </p>
        </div>
        
        <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3, opacity: 0.6, animation: 'pulse 2s infinite' }}>
            <span style={{ color: 'white', fontSize: 'var(--text-micro)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>↓ Scroll</span>
        </div>
      </header>

      {/* NOIRÉ STYLE OVAL SECTION (Value Proposition) */}
      <section className="container" style={{ textAlign: 'center', padding: 'clamp(4rem, 8vw, 8rem) 0' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>02 — Experience</div>
        <h2 className="noire-serif" style={{ maxWidth: '800px', margin: '0 auto 3rem auto', fontSize: 'var(--text-secondary)' }}>
          From the very first contact, you will enjoy the professionalism that has been achieved through 25 years of culinary experience.
        </h2>
        
        <div className="shape-oval" style={{ width: '100%', height: 'clamp(350px, 45vw, 700px)', maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
          <Image src="/copper_pots.jpg" alt="Copper pots hanging in professional kitchen" fill sizes="(max-width: 768px) 100vw, 900px" style={{ objectFit: 'cover' }} />
        </div>
      </section>

      {/* HAUS INK OVERLAP (CTA) */}
      <section className="haus-block-container" style={{ marginTop: 'clamp(0rem, 2vw, 2rem)' }}>
        <div className="container homepage-cta-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1fr', gap: 'clamp(2rem, 8vw, 6rem)', alignItems: 'center' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="menu-index" style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.5)' }}>03 — Celebration</div>
            <h2 className="noire-serif" style={{ color: 'white', marginBottom: '1.5rem' }}>
              Whether a visionary wedding, an elite corporate gala, or a private gathering, we leave a lasting impression.
            </h2>
            <p style={{ fontSize: 'var(--text-body)', maxWidth: '45ch', opacity: 0.6, marginBottom: '2.5rem', color: 'white' }}>
              Expect the absolute best.
            </p>
            <Link href="/contact" className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', display: 'inline-block' }}>Book An Event</Link>
          </div>

          <div className="shape-circle" style={{ position: 'relative', width: 'clamp(220px, 28vw, 420px)', aspectRatio: '1/1', justifySelf: 'end', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Image src="/macro_roulade.jpg" alt="Stuffed pork roulade with fig compote" fill sizes="(max-width: 768px) 100vw, 420px" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
