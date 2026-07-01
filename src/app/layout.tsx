import type { Metadata } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'
import './globals.css'
import PublicShell from '@/components/PublicShell'
import BannerWrapper from '@/components/BannerWrapper'
import { Analytics } from '@vercel/analytics/react'
import { jsonLdSafe } from '@/lib/sanitize'
import { getSettings } from '@/lib/cms'

const instrumentSerif = Instrument_Serif({ 
  subsets: ['latin'], 
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Melting Moments | Catering & Ready-Made Meals, Victoria BC",
  description: 'Melting Moments provides completely custom catering, corporate setups, and specialized buffet installations across Victoria, BC. A symphony of taste for weddings, private events, and formal dining.',
  metadataBase: new URL('https://meltingmoments.ca'),
  alternates: { canonical: './' },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    // './' resolves per-page (same as canonical above) so social shares of
    // deep pages don't all collapse onto the homepage URL
    url: './',
    siteName: 'Melting Moments Catering',
    images: [{ url: '/hero-main.webp', width: 1200, height: 630, alt: 'Melting Moments Catering' }],
  },
  twitter: { card: 'summary_large_image' },
  other: {
    'theme-color': '#070707',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Banner content is fetched server-side (cached, tag 'cms') so public pages
  // don't need the Convex websocket client at all.
  const settings = await getSettings();
  const banner = {
    enabled: settings['banner_enabled'] === 'true',
    text: settings['banner_text'] || '',
    link: settings['banner_link'] || '',
    style: (settings['banner_style'] || 'dark') as 'dark' | 'accent' | 'light',
    showOn: settings['banner_show_on'] || 'all',
  };

  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    // FoodEstablishment is the closest valid LocalBusiness subtype —
    // schema.org has no "CateringService" type
    "@type": "FoodEstablishment",
    "name": "Melting Moments Catering",
    "alternateName": "Guido's Gourmet",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "614 Grenville Ave",
      "addressLocality": "Esquimalt",
      "addressRegion": "BC",
      "postalCode": "V9A 6L2",
      "addressCountry": "CA"
    },
    "telephone": "+1-250-385-2462",
    "url": "https://meltingmoments.ca",
    "image": "https://meltingmoments.ca/hero-main.webp",
    "priceRange": "$$",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 48.4304,
      "longitude": -123.4183
    },
    "sameAs": ["https://www.facebook.com/MeltingMomentsCatering"],
    "servesCuisine": ["Italian", "International", "Buffet", "West Coast"],
    "makesOffer": {
      "@type": "Offer",
      "name": "Guido's Gourmet Ready-Made Meals",
      "description": "Homemade Italian meals ready to heat and serve. Delivery available in Victoria, BC.",
      "url": "https://meltingmoments.ca/guidos"
    }
  };

  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body style={{ fontFamily: 'var(--font-sans)' }}>
        <BannerWrapper data={banner} />
        <PublicShell>
          {children}
        </PublicShell>
        <Analytics />
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: jsonLdSafe(schemaOrgJSONLD) }}
        />
      </body>
    </html>
  )
}
