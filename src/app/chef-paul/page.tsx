import { Metadata } from 'next';
import Image from 'next/image';
import { getCmsContent } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Chef Paul | Victoria BC Catering',
  description: "Meet Chef Paul Silletta — 17 years of culinary craft behind Melting Moments Catering and Guido's Gourmet in Victoria, BC.",
}

export const revalidate = 300;

export default async function ChefPaul() {
  const cms = await getCmsContent();

  const heading = cms('chef_paul_heading', 'GET TO KNOW \nCHEF PAUL');
  const intro = cms('chef_paul_intro', 'Paul cooks the way he grew up eating, with family recipes at the heart of it and flavours picked up along the way, from Italian to Southwest and most points between.');
  const bio = cms('chef_paul_bio', 'Seventeen years in, Paul still plans every menu himself. From your first call, you are talking to the person who will be cooking at your event.');

  return (
    <div>
      <header className="container" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(4rem, 10vw, 8rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>About Us</div>
        <h1 className="haus-display" style={{ maxWidth: '900px', position: 'relative', zIndex: 2, whiteSpace: 'pre-line' }}>
          {heading}
        </h1>
        
        <div className="about-header-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr', gap: '4rem', marginTop: 'clamp(4rem, 8vw, 8rem)' }}>
          <div className="shape-editorial-tall" style={{ width: '100%', aspectRatio: '3/4', position: 'relative' }}>
            <Image src="/chef_plating_sauce.webp" alt="Chef Paul finishing a plate with red wine reduction" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} priority />
          </div>
          
          <div style={{ paddingBottom: '4rem' }}>
            <p style={{ fontSize: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
              {intro}
            </p>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, lineHeight: 1.6 }}>
              {bio}
            </p>
          </div>
        </div>
      </header>
    </div>
  );
}
