import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Our Philosophy | Melting Moments Catering Victoria',
  description: 'Melting Moments eschews mass-production for tailored, site-specific culinary installations across Vancouver Island.',
  openGraph: {
    title: 'Our Philosophy | Melting Moments Catering Victoria',
    description: 'Tailored, site-specific culinary installations across Vancouver Island.',
    images: ['/chef_plating_sauce.jpg'],
  },
}

export default function About() {
  return (
    <div>
      <header className="container" style={{ paddingTop: 'calc(70px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 3rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>01 — The Studio</div>
        <h1 className="haus-display" style={{ maxWidth: '900px', position: 'relative', zIndex: 2 }}>
          OBSESSIVE <br /> ARTISTRY
        </h1>
        
        <div className="about-header-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginTop: '-5vw', alignItems: 'end' }}>
          <div className="shape-editorial-tall" style={{ width: '100%', aspectRatio: '3/4', zIndex: 1, position: 'relative' }}>
            <Image src="/chef_plating_sauce.jpg" alt="Chef plating with red wine reduction" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
          
          <div style={{ paddingBottom: '4rem' }}>
            <p style={{ fontSize: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '400px', marginBottom: '2rem' }}>
              We believe that dining is the ultimate sensory performance.
            </p>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.7, maxWidth: '350px' }}>
              Founded on the principle of unyielding quality in Victoria BC, Melting Moments rejects mass-production in favor of tailored, site-specific culinary installations.
            </p>
          </div>
        </div>
      </header>

      <section className="haus-block-container" style={{ overflow: 'hidden', marginTop: 'clamp(2rem, 4vw, 4rem)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '4rem', position: 'relative' }}>
          
          <div className="menu-index" style={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem', width: '100%' }}>02 — Our Philosophy</div>

          <h2 className="haus-display" style={{ color: 'var(--clr-oat)', zIndex: 3, maxWidth: '1200px' }}>
            SOURCED FROM <br /> THE EARTH
          </h2>

          <div className="about-header-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(4rem, 10vw, 8rem)', marginTop: 'clamp(2rem, 5vw, 6rem)', position: 'relative', zIndex: 2 }}>
            <div>
              <p style={{ fontSize: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', color: 'var(--clr-oat)', lineHeight: 1.2, marginBottom: '2rem', maxWidth: '450px' }}>
                We partner exclusively with local Vancouver Island farms and independent purveyors.
              </p>
              <p style={{ fontSize: 'var(--text-body)', color: 'rgba(255,255,255,0.8)', maxWidth: '400px', lineHeight: 1.6 }}>
                Our commitment extends beyond the kitchen. We believe the story of the food begins with the soil. By utilizing extreme seasonal restraints, our menus reflect the exact moment of your celebration.
              </p>
            </div>

            <div className="shape-oval" style={{ width: '100%', aspectRatio: '1/1', transform: 'translateY(-30%)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
              <Image src="/farm_island.jpg" alt="Vancouver Island farm with misty mountains" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
