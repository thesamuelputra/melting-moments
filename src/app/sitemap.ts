import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  // Tiered priorities: conversion pages highest, utility lowest.
  const routes: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '', priority: 1, changeFrequency: 'monthly' },
    // High-value conversion pages
    { path: '/catering', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/menus', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/weddings', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/corporate', priority: 0.9, changeFrequency: 'monthly' },
    // Service pages
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/chef-paul', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/fountains', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/private-events', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/family-style', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/testimonials', priority: 0.7, changeFrequency: 'monthly' },
    // Utility pages
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/service-area', priority: 0.6, changeFrequency: 'yearly' },
    // (/quote intentionally omitted; it 308-redirects to /contact)
    // Legal pages
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    // Guido's Gourmet
    { path: '/guidos', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/guidos/menu', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/guidos/order', priority: 0.8, changeFrequency: 'monthly' },
  ];

  // No lastModified: stamping every URL with the build time is fake freshness
  // that Google detects and then ignores. Omitting the field entirely is
  // better than an inaccurate one.
  return routes.map((route) => ({
    url: `https://meltingmoments.ca${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
