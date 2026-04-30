'use client';

import Image from 'next/image';
import { useState } from 'react';

type GalleryImage = {
  id: string;
  title: string;
  alt: string;
  url: string;
};

// Hardcoded fallback for when no CMS images are tagged "gallery" yet
const FALLBACK_PHOTOS = [
  { src: '/macro_lunch.webp', title: 'Corporate Luncheon Setup', alt: 'Elegant corporate lunch spread with mixed greens and grilled proteins' },
  { src: '/macro_charcuterie.webp', title: 'Artisan Charcuterie', alt: 'Rustic charcuterie board with cured meats, cheeses, and seasonal fruits' },
  { src: '/macro_fountain.webp', title: 'Chocolate Cascade', alt: 'Belgian chocolate fountain with cascading tiers at a formal event' },
  { src: '/macro_appetizer.webp', title: 'Canapés Display', alt: 'Assorted canapés and appetizer bites arranged on serving trays' },
  { src: '/macro_pasta.webp', title: 'Handmade Pasta', alt: 'Fresh pasta with tomato and basil sauce plated on white ceramic' },
  { src: '/banquet_prep.webp', title: 'Banquet Preparation', alt: 'Kitchen team preparing banquet dishes in a commercial kitchen setup' },
  { src: '/chef_prep.webp', title: 'Chef in Action', alt: 'Chef Paul preparing ingredients with precision knife work' },
  { src: '/macro_family.webp', title: 'Harvest Table', alt: 'Family-style dining table with communal dishes and fresh bread' }
];

export default function GalleryClient({ cmsImages }: { cmsImages?: GalleryImage[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Use CMS images if available, otherwise fallback to static photos
  const useCms = cmsImages && cmsImages.length > 0;
  const photos = useCms
    ? cmsImages.map(img => ({ src: img.url, title: img.title, alt: img.alt }))
    : FALLBACK_PHOTOS;

  return (
    <>
      {/* Editorial Masonry Grid */}
      <section className="container" style={{ paddingTop: 'clamp(2rem, 4vw, 3rem)', paddingBottom: '8rem' }}>
        <div className="gallery-masonry" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
           {photos.map((photo, i) => (
             <div 
               key={i} 
               style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: i % 2 === 1 ? '4rem' : '0', cursor: 'pointer' }}
               onClick={() => setLightbox(i)}
             >
               <div style={{ position: 'relative', width: '100%', aspectRatio: i % 3 === 0 ? '1/1' : '3/4', overflow: 'hidden', borderRadius: i % 3 === 0 ? '50%' : '0', transition: 'transform 0.4s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
               >
                 <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
               </div>
               <div className="menu-index" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.5rem' }}>{photo.title}</div>
             </div>
           ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.92)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out', padding: '2rem',
          }}
        >
          <div style={{ position: 'relative', width: '90vw', height: '80vh', maxWidth: '1200px' }}>
            <Image
              src={photos[lightbox].src}
              alt={photos[lightbox].alt}
              fill
              sizes="90vw"
              style={{ objectFit: 'contain' }}
              quality={90}
            />
          </div>
          <div style={{
            position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
            color: 'white', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem' }}>{photos[lightbox].title}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{lightbox + 1} / {photos.length}</div>
          </div>
          {/* Navigation */}
          {lightbox > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer', padding: '1rem' }}
              aria-label="Previous image"
            >←</button>
          )}
          {lightbox < photos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer', padding: '1rem' }}
              aria-label="Next image"
            >→</button>
          )}
        </div>
      )}
    </>
  );
}
