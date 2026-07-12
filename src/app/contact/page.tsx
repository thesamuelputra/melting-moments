import { getSettings } from '@/lib/cms';
import ContactClient from './ContactClient';
import { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  // Root layout template appends ' | Melting Moments Catering Victoria BC'
  title: 'Contact & Quotes',
  description: 'Get in touch with Melting Moments Catering to plan your wedding, corporate event, or private gathering in Victoria, BC.',
  openGraph: {
    // Page-level openGraph replaces the root object — re-specify the shared fields.
    type: 'website',
    locale: 'en_CA',
    url: '/contact',
    siteName: 'Melting Moments Catering',
    images: [{ url: '/og/og-default.jpg', width: 1200, height: 630, alt: 'Melting Moments Catering' }],
  },
};

export default async function ContactPage() {
  const settings = await getSettings();

  const contactInfo = {
    name: settings['owner'] || 'Paul Silletta',
    businessName: settings['name'] || 'Melting Moments Catering',
    address: settings['address'] || '614 Grenville Ave\nEsquimalt, BC V9A 6L2',
    phone: settings['phone'] || '250-385-2462',
    phoneRaw: (settings['phone'] || '2503852462').replace(/\D/g, ''),
    email: settings['email'] || 'info@meltingmoments.ca',
    website: settings['website'] || 'https://meltingmoments.ca',
  };

  return <ContactClient contactInfo={contactInfo} />;
}
