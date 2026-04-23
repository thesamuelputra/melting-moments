import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/chef-paul',
    '/contact',
    '/corporate',
    '/family-style',
    '/faq',
    '/fountains',
    '/gallery',
    '/menus',
    '/privacy',
    '/private-events',
    '/quote',
    '/service-area',
    '/terms',
    '/testimonials',
    '/weddings'
  ];

  return routes.map((route) => ({
    url: `https://meltingmoments.ca${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
