import { Metadata } from 'next';
import { GUIDOS_DELIVERY_FEE, JsonLd, breadcrumbList } from '@/lib/seo';

export const metadata: Metadata = {
  // Guido's carries its own brand, so bypass the Melting Moments title template.
  title: { absolute: "Order | Guido's Gourmet Ready-Made Meals, Victoria BC" },
  description: `Order ready-made Italian meals for delivery or pickup in Victoria, BC. Flat rate delivery ${GUIDOS_DELIVERY_FEE}.`,
  openGraph: {
    url: '/guidos/order',
    siteName: "Guido's Gourmet",
    locale: 'en_CA',
    type: 'website',
    images: [{ url: '/og/og-guidos.jpg', width: 1200, height: 630, alt: "Guido's Gourmet, ready-made Italian meals in Victoria BC" }],
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
