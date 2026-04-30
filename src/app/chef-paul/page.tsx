import { Metadata } from 'next';
import Image from 'next/image';
import { getCmsContent } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Chef Paul | Victoria BC Catering',
  description: 'Get to know Chef Paul from Melting Moments Catering.',
}

export default async function ChefPaul() {
  const cms = await getCmsContent();

  const heading = cms('chef_paul_heading', 'GET TO KNOW \nCHEF PAUL');
  const intro = cms('chef_paul_intro', 'International cuisine influences many of our flavorful dishes, from Southwest to Italian and everything in between.');
  const bio = cms('chef_paul_bio', 'From the very first contact with Melting Moments Catering, you will enjoy the professionalism that has been achieved through 16 years of culinary experience.');

  return (
    <div>
      <header className="container" style={{ paddingTop: 'calc(80px + 4vw)', paddingBottom: 'clamp(4rem, 10vw, 8rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>About Us</div>
        <h1 className="haus-display" style={{ maxWidth: '900px', position: 'relative', zIndex: 2, whiteSpace: 'pre-line' }}>
          {heading}
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr', gap: '4rem', marginTop: 'clamp(4rem, 8vw, 8rem)' }}>
          <div className="shape-editorial-tall" style={{ width: '100%', aspectRatio: '3/4', position: 'relative' }}>
            <Image src="/chef_salmon.webp" alt="Chef Paul plating salmon with lemon" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} quality={100} priority />
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
