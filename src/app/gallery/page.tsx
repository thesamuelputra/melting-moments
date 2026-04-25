import { Metadata } from 'next';
import GalleryClient from './GalleryClient';

export const metadata: Metadata = {
  title: 'Gallery | Melting Moments Catering Victoria',
  description: 'Visual exhibition of our event installations, plate designs, and culinary artistry.',
  openGraph: {
    title: 'Gallery | Melting Moments Catering Victoria',
    description: 'Visual exhibition of our event installations, plate designs, and culinary artistry.',
    images: ['/macro_charcuterie.webp'],
  },
};

export default function Gallery() {
  return (
    <div>
      <header className="container" style={{ paddingTop: 'calc(80px + 3vw)' }}>
        <div className="menu-index" style={{ marginBottom: "1.5rem" }}>Information</div>
        <h1 className="haus-display">GALLERY</h1>
      </header>
      <GalleryClient />
    </div>
  );
}
