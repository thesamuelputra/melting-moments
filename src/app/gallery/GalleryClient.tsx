'use client';

import Image from 'next/image';
import { useState } from 'react';

const photos = [
  { src: '/macro_lunch.webp', title: 'Corporate Luncheon Setup', alt: 'Elegant corporate lunch spread with mixed greens and grilled proteins' },
  { src: '/macro_charcuterie.webp', title: 'Artisan Charcuterie', alt: 'Rustic charcuterie board with cured meats, cheeses, and seasonal fruits' },
  { src: '/macro_fountain.webp', title: 'Chocolate Cascade', alt: 'Belgian chocolate fountain with cascading tiers at a formal event' },
  { src: '/macro_appetizer.webp', title: 'Canapés Display', alt: 'Assorted canapés and appetizer bites arranged on serving trays' },
  { src: '/macro_pasta.webp', title: 'Handmade Pasta', alt: 'Fresh pasta with tomato and basil sauce plated on white ceramic' },
  { src: '/banquet_prep.webp', title: 'Banquet Preparation', alt: 'Kitchen team preparing banquet dishes in a commercial kitchen setup' },
  { src: '/chef_prep.webp', title: 'Chef in Action', alt: 'Chef Paul preparing ingredients with precision knife work' },
  { src: '/macro_family.webp', title: 'Harvest Table', alt: 'Family-style dining table with communal dishes and fresh bread' }
];

export default function GalleryClient() {
  const [lightbox, setLightbox] = useState<number | null>(null);

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

      {/* Lightbox Modal (#23) */}
      {lightbox !== null && (
        <div 
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setLightbox(null);
            if (e.key === 'ArrowRight') setLightbox((lightbox + 1) % photos.length);
            if (e.key === 'ArrowLeft') setLightbox((lightbox - 1 + photos.length) % photos.length);
          }}
          tabIndex={0}
          role="dialog"
          aria-label="Image lightbox"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 50000,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {/* Previous */}
          <button 
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length); }}
            style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer', padding: '1rem', zIndex: 50001 }}
            aria-label="Previous image"
          >
            ←
          </button>

          {/* Image */}
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '80vw', height: '80vh', maxWidth: '1200px' }}>
            <Image src={photos[lightbox].src} alt={photos[lightbox].alt} fill sizes="80vw" style={{ objectFit: 'contain' }} priority />
          </div>

          {/* Next */}
          <button 
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length); }}
            style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer', padding: '1rem', zIndex: 50001 }}
            aria-label="Next image"
          >
            →
          </button>

          {/* Close */}
          <button 
            onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: '1rem', zIndex: 50001 }}
            aria-label="Close lightbox"
          >
            ✕
          </button>

          {/* Caption */}
          <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {photos[lightbox].title} · {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
