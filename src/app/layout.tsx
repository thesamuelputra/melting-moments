import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'
import './globals.css'
import PublicShell from '@/components/PublicShell'
import BannerWrapper from '@/components/BannerWrapper'
import { Analytics } from '@vercel/analytics/react'
import { getSettings } from '@/lib/cms'
import { SITE, catererNode, websiteNode, JsonLd } from '@/lib/seo'

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
  title: {
    default: 'Melting Moments | Catering & Ready-Made Meals, Victoria BC',
    // Pages set just their unique phrase (e.g. 'Wedding Catering'); the
    // template appends the brand + geo suffix. Guido's routes opt out with
    // `title: { absolute: ... }` to carry their own brand.
    template: '%s | Melting Moments Catering Victoria BC',
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
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
    images: [{ url: '/og/og-default.jpg', width: 1200, height: 630, alt: 'Melting Moments Catering' }],
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  themeColor: '#070707',
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

  // Entity graph: business + website nodes, identity signals sourced from CMS
  // settings so the owner can grow sameAs/hours without a deploy.
  const sameAs = [
    settings['social_facebook'] || SITE.facebook,
    settings['social_instagram'],
    settings['social_google_business'],
  ].filter((url): url is string => Boolean(url));
  const business = catererNode({
    sameAs,
    hoursNote: settings['business_hours_note'] || 'Consultations & tastings by appointment',
  });

  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body style={{ fontFamily: 'var(--font-sans)' }}>
        <BannerWrapper data={banner} />
        <PublicShell>
          {children}
        </PublicShell>
        <Analytics />
        <JsonLd data={business} />
        <JsonLd data={websiteNode()} />
      </body>
    </html>
  )
}
