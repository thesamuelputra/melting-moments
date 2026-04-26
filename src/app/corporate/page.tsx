import Image from 'next/image';
import db from '@/lib/db';
import CorporateMenuClient from './CorporateMenuClient';

export const dynamic = 'force-dynamic';

export default async function Corporate() {
  // Fetch corporate-relevant categories from database
  const menuItems = await db.menuItem.findMany({
    where: {
      category: { in: ['BREAKFAST', 'LUNCH'] },
      isActive: true,
    },
    orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }],
  });

  return (
    <div>
      <header className="container page-header-grid" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr', gap: '3rem', alignItems: 'center' }}>
        <div>
          <div className="menu-index" style={{ marginBottom: '2rem' }}>Corporate Functions</div>
          <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}>
            BOARDROOM <br /> TO BANQUET
          </h1>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '40ch', marginTop: '2rem', lineHeight: 1.6 }}>
            You&apos;ve got less than 24 hours to plan a continental breakfast or a lunch. It has to be good. It has to be quick. It has to be now. Why bother trying to get reservations somewhere, or trying to find something that will please everyone, when we can bring it all right to you?
          </p>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '40ch', marginTop: '1rem', lineHeight: 1.6 }}>
            Whether it&apos;s that breakfast for 300 in your lobby or a formal boardroom luncheon for 20, a simple brown-bag lunch or a full china and crystal setting we&apos;ve got it covered.
          </p>
        </div>
        
        <div className="shape-editorial-tall" style={{ width: '100%', position: 'relative', aspectRatio: '16/9' }}>
          <Image src="/macro_appetizer.webp" alt="Corporate Event Appetizers" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        </div>
      </header>

      <CorporateMenuClient menuItems={menuItems} />
    </div>
  );
}
