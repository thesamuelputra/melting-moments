import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Chef Paul | Victoria BC Catering',
  description: 'Get to know Chef Paul from Melting Moments Catering.',
}

export default function ChefPaul() {
  return (
    <div>
      <header className="container" style={{ paddingTop: 'calc(80px + 4vw)', paddingBottom: 'clamp(4rem, 10vw, 8rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>About Us</div>
        <h1 className="haus-display" style={{ maxWidth: '900px', position: 'relative', zIndex: 2 }}>
          GET TO KNOW <br /> CHEF PAUL
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr', gap: '4rem', marginTop: 'clamp(4rem, 8vw, 8rem)' }}>
          <div className="shape-editorial-tall" style={{ width: '100%', aspectRatio: '3/4', position: 'relative' }}>
            <Image src="/chef_salmon.jpg" alt="Chef Paul plating salmon with lemon" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} quality={100} priority />
          </div>
          
          <div style={{ paddingBottom: '4rem' }}>
            <p style={{ fontSize: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
              International cuisine influences many of our flavorful dishes, from Southwest to Italian and everything in between.
            </p>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, lineHeight: 1.6 }}>
              From the very first contact with Melting Moments Catering, you will enjoy the professionalism that has been achieved through 16 years of culinary experience.
            </p>
          </div>
        </div>
      </header>
    </div>
  );
}
