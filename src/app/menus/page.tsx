import Image from 'next/image';
import { Metadata } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { getCmsContent } from '@/lib/cms';
import MenuClient from './MenuClient';

export const metadata: Metadata = {
  title: 'Catering Menus | Melting Moments Victoria BC',
  description: 'Browse our catering menus, from Italian family-style dinners to corporate luncheons and BBQ packages. Award-winning cuisine in Victoria, BC.',
  openGraph: {
    title: 'Catering Menus | Melting Moments Victoria BC',
    description: 'Browse our catering menus. Italian family-style, corporate, BBQ, and more.',
  },
};

export default async function MenusPage() {
  const [items, cms] = await Promise.all([
    fetchQuery(api.menuItems.listActive),
    getCmsContent(),
  ]);

  const headerIndex = cms('menus_header_index', 'Explore Our Offerings');
  const headerTitle = cms('menus_header_title', 'CATERING\nMENUS');
  const disclaimer = cms('menus_disclaimer', 'These catering menus are just a sample of what you can expect. We can customize any menu to suit your needs. All 5% taxes and 15% gratuity are extra. A deposit of 25% is required at time of booking. Balance due 7 days prior to function. Guaranteed number of guests required 2 weeks in advance. Per person pricing based on a minimum of 75 guests. Prices may change without notice.');

  // Serialize Convex items to plain objects for the client component
  const menuItems = items.map((item) => ({
    id: item._id,
    category: item.category,
    name: item.name,
    description: item.description,
    price: item.price ?? null,
    priceLabel: item.priceLabel,
    orderIndex: item.orderIndex,
    isActive: item.isActive,
    isFeatured: item.isFeatured,
  }));

  return (
    <div>
      <header className="container" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(1rem, 2vw, 2rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>{headerIndex}</div>
        <h1 className="haus-display" style={{ marginBottom: '4rem' }}>
          {headerTitle.split('\n').map((line, i) => (
            <span key={i}>{line}{i < headerTitle.split('\n').length - 1 && <br />}</span>
          ))}
        </h1>
        <div className="shape-editorial-tall" style={{ width: '100%', position: 'relative', aspectRatio: '16/9', marginBottom: '4rem' }}>
          <Image src="/catering_menu_hero.jpg" alt="Assorted catering dishes including pasta, steak, and chicken roulade" fill sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} priority quality={100} />
        </div>
      </header>
      <MenuClient menuItems={menuItems} disclaimer={disclaimer} />
    </div>
  );
}
