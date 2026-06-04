import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu | Guido\'s Gourmet - Ready-Made Italian Meals Victoria BC',
  description: 'Lasagnes, pot pies, soups, pasta, and desserts. Order online or visit by appointment. Delivery available in Victoria, BC.',
};

export default function GuidosMenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
