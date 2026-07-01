import { Metadata } from 'next';
import Image from 'next/image';
import { getCmsContent } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Our Philosophy | Melting Moments Catering Victoria',
  description: 'Family recipes, Vancouver Island ingredients, and custom menus built around your event. Catering in Victoria, BC since 2009.',
  openGraph: {
    url: '/about',
    siteName: 'Melting Moments Catering',
    locale: 'en_CA',
    type: 'website',
    title: 'Our Philosophy | Melting Moments Catering Victoria',
    description: 'Family recipes and custom catering across Vancouver Island.',
    images: ['/chef_plating_sauce.webp'],
  },
}

export const revalidate = 300;

export default async function About() {
  const cms = await getCmsContent();

  const headerIndex = cms('about_header_index', '01 · The Studio');
  const headerTitle = cms('about_header_title', 'COOKED\nWITH CARE');
  const tagline = cms('about_header_tagline', 'We believe good food should make an occasion feel like one.');
  const headerBody = cms('about_header_body', 'We started in a family kitchen in Victoria, BC, and we still cook that way: from scratch, by hand, with menus built around your event rather than a set list.');
  const philIndex = cms('about_philosophy_index', '02 · Our Philosophy');
  const philTitle = cms('about_philosophy_title', 'SOURCED FROM\nTHE EARTH');
  const philTagline = cms('about_philosophy_tagline', 'We buy from Vancouver Island farms and independent purveyors we know by name.');
  const philBody = cms('about_philosophy_body', 'Good food starts with good ingredients, so we cook with what the Island is growing right now. That means your menu tastes like the season your celebration lands in.');

  return (
    <div>
      <header className="container" style={{ paddingTop: 'calc(70px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 3rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>{headerIndex}</div>
        <h1 className="haus-display" style={{ maxWidth: '900px', position: 'relative', zIndex: 2 }}>
          {headerTitle.split('\n').map((line, i) => (
            <span key={i}>{line}{i < headerTitle.split('\n').length - 1 && <br />}</span>
          ))}
        </h1>
        
        <div className="about-header-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginTop: '-5vw', alignItems: 'end' }}>
          <div className="shape-editorial-tall" style={{ width: '100%', aspectRatio: '3/4', zIndex: 1, position: 'relative' }}>
            <Image src="/chef_plating_sauce.webp" alt="Chef plating with red wine reduction" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} priority />
          </div>
          
          <div style={{ paddingBottom: '4rem' }}>
            <p style={{ fontSize: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '400px', marginBottom: '2rem' }}>
              {tagline}
            </p>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.7, maxWidth: '350px' }}>
              {headerBody}
            </p>
          </div>
        </div>
      </header>

      <section className="haus-block-container" style={{ overflow: 'hidden', marginTop: 'clamp(2rem, 4vw, 4rem)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '4rem', position: 'relative' }}>
          
          <div className="menu-index" style={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem', width: '100%' }}>{philIndex}</div>

          <h2 className="haus-display" style={{ color: 'var(--clr-oat)', zIndex: 3, maxWidth: '1200px' }}>
            {philTitle.split('\n').map((line, i) => (
              <span key={i}>{line}{i < philTitle.split('\n').length - 1 && <br />}</span>
            ))}
          </h2>

          <div className="about-header-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(4rem, 10vw, 8rem)', marginTop: 'clamp(2rem, 5vw, 6rem)', position: 'relative', zIndex: 2 }}>
            <div>
              <p style={{ fontSize: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', color: 'var(--clr-oat)', lineHeight: 1.2, marginBottom: '2rem', maxWidth: '450px' }}>
                {philTagline}
              </p>
              <p style={{ fontSize: 'var(--text-body)', color: 'rgba(255,255,255,0.8)', maxWidth: '400px', lineHeight: 1.6 }}>
                {philBody}
              </p>
            </div>

            <div className="shape-oval" style={{ width: '100%', aspectRatio: '1/1', transform: 'translateY(-30%)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
              <Image src="/farm_island.webp" alt="Vancouver Island farm with misty mountains" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
