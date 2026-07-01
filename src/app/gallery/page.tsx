import { Metadata } from 'next';
import { getGalleryImages } from '@/lib/cms';
import GalleryClient from './GalleryClient';

// ISR: pairs with the unstable_cache wrappers in src/lib/cms.ts
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Gallery | Melting Moments Catering Victoria',
  description: 'Visual exhibition of our event installations, plate designs, and culinary artistry.',
  openGraph: {
    title: 'Gallery | Melting Moments Catering Victoria',
    description: 'Visual exhibition of our event installations, plate designs, and culinary artistry.',
    images: ['/hero-main.webp'],
    siteName: 'Melting Moments Catering',
    locale: 'en_CA',
    type: 'website',
    url: '/gallery',
  },
};

export default async function Gallery() {
  // Convex outage degrades to the hardcoded fallback photos in GalleryClient
  const images = await getGalleryImages().catch(() => []);

  const cmsImages = images
    .filter((img) => img.url) // Only images with resolved URLs
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((img) => ({
      id: img._id as string,
      title: img.title,
      alt: img.alt,
      url: img.url!,
    }));

  return (
    <div>
      <header className="container" style={{ paddingTop: 'calc(80px + 3vw)' }}>
        <div className="menu-index" style={{ marginBottom: "1.5rem" }}>Information</div>
        <h1 className="haus-display">GALLERY</h1>
      </header>
      <GalleryClient cmsImages={cmsImages} />
    </div>
  );
}
