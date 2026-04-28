import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import ContactClient from './ContactClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Melting Moments Catering Victoria BC',
  description: 'Get in touch with Melting Moments Catering to plan your wedding, corporate event, or private gathering in Victoria, BC.',
};

export default async function ContactPage() {
  const settings = await fetchQuery(api.businessSettings.getAll);

  const contactInfo = {
    name: settings['name'] || 'Paul Silletta',
    businessName: settings['name'] ? 'Melting Moments Catering' : 'Melting Moments Catering',
    address: settings['address'] || '614 Grenville Ave\nEsquimalt, BC V9A 6L2',
    phone: settings['phone'] || '250.385.2462',
    phoneRaw: (settings['phone'] || '2503852462').replace(/\D/g, ''),
    email: settings['email'] || 'info@meltingmoments.ca',
    website: settings['website'] || 'https://meltingmoments.ca',
  };

  return <ContactClient contactInfo={contactInfo} />;
}
