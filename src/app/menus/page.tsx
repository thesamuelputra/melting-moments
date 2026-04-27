import Image from 'next/image';
import { Metadata } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import MenuClient from './MenuClient';

export const metadata: Metadata = {
  title: 'Catering Menus | Melting Moments Victoria BC',
  description: 'Browse our catering menus — from Italian family-style dinners to corporate luncheons and BBQ packages. Award-winning cuisine in Victoria, BC.',
  openGraph: {
    title: 'Catering Menus | Melting Moments Victoria BC',
    description: 'Browse our catering menus — Italian family-style, corporate, BBQ, and more.',
  },
};

export default async function MenusPage() {
  const items = await fetchQuery(api.menuItems.listActive);

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
        <div className="menu-index" style={{ marginBottom: '2rem' }}>Explore Our Offerings</div>
        <h1 className="haus-display" style={{ marginBottom: '4rem' }}>
          CATERING <br /> MENUS
        </h1>
        <div className="shape-editorial-tall" style={{ width: '100%', position: 'relative', aspectRatio: '16/9', marginBottom: '4rem' }}>
          <Image src="/catering_menu_hero.jpg" alt="Assorted catering dishes including pasta, steak, and chicken roulade" fill sizes="(max-width: 768px) 100vw, 100vw" style={{ objectFit: 'cover' }} priority />
        </div>
      </header>
      <MenuClient menuItems={menuItems} />
    </div>
  );
}
