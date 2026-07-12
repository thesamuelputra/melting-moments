import { Metadata } from 'next';

export const metadata: Metadata = {
  // Guido's carries its own brand, so bypass the Melting Moments title template.
  title: { absolute: "Menu | Guido's Gourmet Ready-Made Meals, Victoria BC" },
  description: 'Lasagnes, pot pies, soups, pasta, and desserts. Order online or visit by appointment. Delivery available in Victoria, BC.',
  openGraph: {
    url: '/guidos/menu',
    siteName: "Guido's Gourmet",
    locale: 'en_CA',
    type: 'website',
    images: [{ url: '/og/og-default.jpg', width: 1200, height: 630, alt: "Guido's Gourmet by Melting Moments Catering" }],
  },
};

export default function GuidosMenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
