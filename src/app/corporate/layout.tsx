import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Corporate Catering & Office Lunches',
  description: 'From continental breakfasts to boardroom luncheons for 20 or 300. Melting Moments delivers corporate catering across Victoria, BC.',
  openGraph: {
    url: '/corporate',
    siteName: 'Melting Moments Catering',
    locale: 'en_CA',
    type: 'website',
    images: [{ url: '/og/og-corporate.jpg', width: 1200, height: 630, alt: 'Plated dishes on a steel service table by Melting Moments Catering' }],
  },
};

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
