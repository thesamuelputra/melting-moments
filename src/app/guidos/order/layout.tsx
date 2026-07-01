import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order | Guido\'s Gourmet - Ready-Made Italian Meals Victoria BC',
  description: 'Order ready-made Italian meals for delivery or pickup in Victoria, BC. Flat rate delivery $12.50.',
};

// Segment config lives here because page.tsx is a client component
export const revalidate = 300;

export default function GuidosOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
