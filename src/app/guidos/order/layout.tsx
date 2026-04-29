import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order | Guido\'s Gourmet - Ready-Made Italian Meals Victoria BC',
  description: 'Order ready-made Italian meals for delivery or pickup in Victoria, BC. Flat rate delivery $12.50.',
};

export default function GuidosOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
