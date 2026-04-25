import Image from 'next/image';
import MenuClient from './MenuClient';
import db from '@/lib/db';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catering Menus | Melting Moments Victoria BC',
  description: 'Browse our catering menus — from Italian family-style dinners to corporate luncheons and BBQ packages. Award-winning cuisine in Victoria, BC.',
};

// revalidatePath from admin actions triggers immediate refresh
export const revalidate = 0;

export default async function Menus() {
  const items = await db.menuItem.findMany({
    orderBy: [
      { orderIndex: 'asc' }
    ]
  });

  return (
    <div>
      <header className="container page-header-grid" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr', gap: '3rem', alignItems: 'center' }}>
        <div>
          <div className="menu-index" style={{ marginBottom: '1.5rem' }}>Culinary Archive</div>
          <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}>
            THE <br /> MENUS
          </h1>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '40ch', marginTop: '1.5rem', lineHeight: 1.6 }}>
            International cuisine influences many of our flavourful dishes, from Southwest to Italian and everything in between. 16 years of culinary experience — expect the best.
          </p>
        </div>
        <div className="shape-editorial-tall" style={{ width: '100%', position: 'relative', aspectRatio: '4/5' }}>
          <Image src="/menu-pasta.jpg" alt="Penne Alfredo on stainless steel" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px" style={{ objectFit: 'cover' }} />
        </div>
      </header>

      <MenuClient menuItems={items} />
    </div>
  );
}
