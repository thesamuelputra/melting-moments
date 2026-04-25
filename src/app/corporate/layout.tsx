import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Corporate Catering | Melting Moments Victoria BC',
  description: 'From continental breakfasts to boardroom luncheons for 20 or 300 — Melting Moments delivers corporate catering across Victoria, BC.',
};

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
