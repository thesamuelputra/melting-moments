import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & Book an Event | Melting Moments Catering Victoria',
  description: 'Request a quote for your next corporate event, wedding, or private gathering. Contact Chef Paul and the Melting Moments team in Victoria, BC.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
