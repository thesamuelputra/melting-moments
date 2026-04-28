import Image from 'next/image';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import CorporateMenuClient from './CorporateMenuClient';
import { getCmsValue } from '@/lib/cms';

export default async function Corporate() {
  const [allItems, settings] = await Promise.all([
    fetchQuery(api.menuItems.listActive),
    fetchQuery(api.businessSettings.getAll),
  ]);

  const menuItems = allItems
    .filter((item) => ['BREAKFAST', 'LUNCH'].includes(item.category))
    .map((item) => ({
      id: item._id,
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price ?? null,
      priceLabel: item.priceLabel,
      orderIndex: item.orderIndex,
      isActive: item.isActive,
    }));

  const cms = (key: string, def: string) => getCmsValue(settings, key, def);

  return (
    <div>
      <header className="container page-header-grid" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr', gap: '3rem', alignItems: 'center' }}>
        <div>
          <div className="menu-index" style={{ marginBottom: '2rem' }}>
            {cms('corporate_header_index', 'Corporate Functions')}
          </div>
          <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}>
            {cms('corporate_header_title', 'BOARDROOM\nTO BANQUET').split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h1>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '40ch', marginTop: '2rem', lineHeight: 1.6 }}>
            {cms('corporate_body_1', "You've got less than 24 hours to plan a continental breakfast or a lunch. It has to be good. It has to be quick. It has to be now. Why bother trying to get reservations somewhere, or trying to find something that will please everyone, when we can bring it all right to you?")}
          </p>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '40ch', marginTop: '1rem', lineHeight: 1.6 }}>
            {cms('corporate_body_2', "Whether it's that breakfast for 300 in your lobby or a formal boardroom luncheon for 20, a simple brown-bag lunch or a full china and crystal setting we've got it covered.")}
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
