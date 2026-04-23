export const metadata = {
  title: 'Gallery | Melting Moments Catering Victoria',
  description: 'Visual exhibition of our physical event installations and plate designs.',
}

import Image from 'next/image';

export default function Gallery() {
  const photos = [
    { src: '/macro_lunch.webp', title: 'Corporate Setup' },
    { src: '/macro_charcuterie.webp', title: 'Macro Detail' },
    { src: '/macro_fountain.webp', title: 'Chocolate Cascade' },
    { src: '/macro_appetizer.webp', title: 'Canapés' },
    { src: '/macro_pasta.webp', title: 'Award Winning Pasta' },
    { src: '/banquet_prep.webp', title: 'Event Prep' },
    { src: '/chef_prep.webp', title: 'Action Shot' },
    { src: '/macro_family.webp', title: 'Harvest Table' }
  ];

  return (
    <div>
      <header className="container" style={{ paddingTop: 'calc(70px + 3vw)' }}>
        <div className="menu-index" style={{ marginBottom: "1.5rem" }}>Information</div>
        <h1 className="haus-display">GALLERY</h1>
      </header>
      
      {/* Editorial Masonry Grid */}
      <section className="container" style={{ paddingTop: 'clamp(2rem, 4vw, 3rem)', paddingBottom: '8rem' }}>
        <div className="gallery-masonry" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
           {photos.map((photo, i) => (
             <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: i % 2 === 1 ? '4rem' : '0' }}>
               <div className={i % 3 === 0 ? "shape-oval" : "shape-editorial-tall"} style={{ position: 'relative', width: '100%' }}>
                 <Image src={photo.src} alt={photo.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
               </div>
               <div className="menu-index" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.5rem' }}>{photo.title}</div>
             </div>
           ))}
        </div>
      </section>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .gallery-masonry > div { margin-top: 0 !important; }
        }
      `}} />
    </div>
  );
}
