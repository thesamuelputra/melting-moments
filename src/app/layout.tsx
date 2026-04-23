import type { Metadata } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'
import './globals.css'
import GlobalNav from '@/components/GlobalNav'
import Footer from '@/components/Footer'
import ScrollIndicator from '@/components/ScrollIndicator'
import Preloader from '@/components/Preloader'
import PageTransition from '@/components/PageTransition'

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
  title: 'Melting Moments | Award Winning Catering Victoria BC',
  description: 'Melting Moments provides completely custom catering, corporate setups, and specialized buffet installations across Victoria, BC. A symphony of taste for weddings, private events, and formal dining.',
  metadataBase: new URL('https://meltingmoments.ca'),
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://meltingmoments.ca',
    siteName: 'Melting Moments Catering',
    images: [{ url: '/hero-main.jpg', width: 1200, height: 630, alt: 'Melting Moments Catering' }],
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@type": "CateringService",
    "name": "Melting Moments Catering",
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
    "priceRange": "$$",
    "servesCuisine": ["International", "Buffet", "West Coast"]
  };

  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body style={{ fontFamily: 'var(--font-sans)' }}>
        <Preloader />
        <a href="#main-content" className="skip-nav">Skip to main content</a>
        <ScrollIndicator />
        <GlobalNav />
        <main id="main-content">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJSONLD) }} 
        />
      </body>
    </html>
  )
}
