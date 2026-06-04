import { Metadata } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
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

export default async function Gallery() {
  const images = await fetchQuery(api.files.list, { section: 'gallery' });

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
