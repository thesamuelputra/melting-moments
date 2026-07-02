'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type GalleryImage = {
  id: string;
  title: string;
  alt: string;
  url: string;
};

// Hardcoded fallback for when no CMS images are tagged "gallery" yet
const FALLBACK_PHOTOS = [
  { src: '/chef_plating_sauce.webp', title: 'Finishing the Plate', alt: 'Chef spooning red wine reduction over a plated entrée' },
  { src: '/macro_appetizer.webp', title: 'Canapés Display', alt: 'Assorted canapés and appetizer bites arranged on slate' },
  { src: '/banquet_prep.webp', title: 'Banquet Service', alt: 'Kitchen team plating banquet dishes in a commercial kitchen' },
  { src: '/macro_pasta.webp', title: 'Penne Pomodoro', alt: 'Fresh pasta with tomato and basil sauce in a stoneware bowl' },
  { src: '/chef_prep.webp', title: 'Knife Work', alt: 'Chef preparing fresh produce with precision knife work' },
  { src: '/wedding_entree.webp', title: 'Wedding Entrée', alt: 'Herb-crusted lamb medallions plated for a wedding reception' },
  { src: '/chef_salmon.webp', title: 'Salmon, Plated', alt: 'Chef finishing a plated salmon with lemon and dill' },
  { src: '/chocolate_fountain.webp', title: 'Chocolate Fountain', alt: 'Guest dipping a strawberry at a chocolate fountain station' },
  { src: '/private_dinner.webp', title: 'Private Dinner', alt: 'Sliced roast with cranberry compote plated for a private dinner' },
  { src: '/copper_pots.webp', title: 'The Kitchen', alt: 'Copper pots hanging above the range in the kitchen' }
];

export default function GalleryClient({ cmsImages }: { cmsImages?: GalleryImage[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const openedFromTile = useRef<HTMLButtonElement | null>(null);

  // Use CMS images if available, otherwise fallback to static photos
  const useCms = cmsImages && cmsImages.length > 0;
  const photos = useCms
    ? cmsImages.map(img => ({ src: img.url, title: img.title, alt: img.alt }))
    : FALLBACK_PHOTOS;
  const photoCount = photos.length;

  const openLightbox = (i: number) => {
    openedFromTile.current = tileRefs.current[i] ?? null;
    setLightbox(i);
  };

  // Close and return focus to the tile that opened the lightbox
  const closeLightbox = useCallback(() => {
    setLightbox(null);
    openedFromTile.current?.focus();
    openedFromTile.current = null;
  }, []);

  const isOpen = lightbox !== null;

  // Modal behavior while open: focus close button, lock body scroll, keyboard controls
  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        setLightbox(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'ArrowRight') {
        setLightbox(prev => (prev !== null && prev < photoCount - 1 ? prev + 1 : prev));
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, photoCount, closeLightbox]);

  return (
    <>
      {/* Editorial Masonry Grid */}
      <section className="container" style={{ paddingTop: 'clamp(2rem, 4vw, 3rem)', paddingBottom: '8rem' }}>
        <div className="gallery-masonry" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
           {photos.map((photo, i) => (
             <button
               key={i}
               type="button"
               ref={(el) => { tileRefs.current[i] = el; }}
               aria-label={`View ${photo.title || 'photo'}`}
               onClick={() => openLightbox(i)}
               style={{
                 background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit',
                 textAlign: 'inherit', cursor: 'pointer', width: '100%',
                 display: 'flex', flexDirection: 'column', gap: '1rem',
                 marginTop: i % 2 === 1 ? '4rem' : '0',
               }}
             >
               <div style={{ position: 'relative', width: '100%', aspectRatio: i % 3 === 0 ? '1/1' : '3/4', overflow: 'hidden', borderRadius: i % 3 === 0 ? '50%' : '0', transition: 'transform 0.4s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
               >
                 <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
               </div>
               <div className="menu-index" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.5rem' }}>{photo.title}</div>
             </button>
           ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={photos[lightbox].title || 'Photo'}
          onClick={closeLightbox}
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
          {/* Close */}
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--clr-bone)', fontSize: '1.75rem', lineHeight: 1, cursor: 'pointer', padding: '0.75rem' }}
          >✕</button>
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
