import { Metadata } from 'next';
import { JsonLd, breadcrumbList } from '@/lib/seo';

export const metadata: Metadata = {
  // Guido's carries its own brand, so bypass the Melting Moments title template.
  title: { absolute: "Order | Guido's Gourmet Ready-Made Meals, Victoria BC" },
  description: 'Order ready-made Italian meals for delivery or pickup in Victoria, BC. Flat rate delivery $12.50.',
  openGraph: {
    url: '/guidos/order',
    siteName: "Guido's Gourmet",
    locale: 'en_CA',
    type: 'website',
    images: [{ url: '/og/og-default.jpg', width: 1200, height: 630, alt: "Guido's Gourmet by Melting Moments Catering" }],
  },
};

// Segment config lives here because page.tsx is a client component
export const revalidate = 300;

export default function GuidosOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Breadcrumbs live here because page.tsx is a client component */}
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: "Guido's Gourmet", path: '/guidos' },
          { name: 'Order', path: '/guidos/order' },
        ])}
      />
      {children}
    </>
  );
}
