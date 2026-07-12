import Image from 'next/image';
import { Metadata } from 'next';
import { getCmsValue, getMenuItems, getSettings } from '@/lib/cms';
import { JsonLd, menuNode } from '@/lib/seo';
import MenuClient from './MenuClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Catering Menus | Melting Moments Victoria BC',
  description: 'Browse our catering menus, from Italian family-style dinners to corporate luncheons and BBQ packages. Acclaimed cuisine in Victoria, BC.',
  openGraph: {
    url: '/menus',
    siteName: 'Melting Moments Catering',
    locale: 'en_CA',
    type: 'website',
    title: 'Catering Menus | Melting Moments Victoria BC',
    description: 'Browse our catering menus. Italian family-style, corporate, BBQ, and more.',
    images: ['/catering_menu_hero.webp'],
  },
};

// Fallback section order when the menu_category_order setting is unset —
// mirrors the original hardcoded order in MenuClient.tsx.
const DEFAULT_CATEGORY_ORDER = [
  'BREADS', 'ANTIPASTO', 'SALADS', 'STARCHES', 'VEGETABLES',
  'SEAFOOD', 'ENTREES', 'PACKAGES', 'SOIREE', 'PEASANO',
  'MEXICAN', 'BBQ', 'LUNCH', 'BREAKFAST', 'BEVERAGES',
];

// Public display names for JSON-LD MenuSection nodes.
// Keep in sync with formatCategoryName in MenuClient.tsx.
const CATEGORY_LABELS: Record<string, string> = {
  BREADS: 'Breads',
  ANTIPASTO: 'Antipasto Platters',
  SALADS: 'Salads',
  STARCHES: 'Starches',
  VEGETABLES: 'Vegetables',
  SEAFOOD: 'Gourmet Mirrors',
  ENTREES: 'Chef Carved',
  PACKAGES: 'Buffet Packages',
  SOIREE: 'Soirée',
  PEASANO: 'Peasano Dinner',
  MEXICAN: 'Mexican Fiesta',
  BBQ: 'BBQ Menus',
  LUNCH: 'Lunch',
  BREAKFAST: 'Breakfast',
  BEVERAGES: 'Beverages',
};

export default async function MenusPage() {
  const [items, settings] = await Promise.all([
    getMenuItems().catch(() => []),
    getSettings(),
  ]);
  const cms = (key: string, fallback: string) => getCmsValue(settings, key, fallback);

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

  // Section order: CMS-managed via the admin Menu editor ("Order categories"),
  // falling back to the original hardcoded order; unknown categories appended.
  const savedOrder = (settings['menu_category_order'] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const baseOrder = savedOrder.length > 0 ? savedOrder : DEFAULT_CATEGORY_ORDER;
  const categoryOrder = Array.from(new Set([...baseOrder, ...menuItems.map((m) => m.category)]));

  // schema.org Menu JSON-LD fed from the SAME server-fetched items.
  // menuNode emits an Offer only when price is a number (null prices skipped).
  const sections = categoryOrder
    .map((cat) => ({
      name: CATEGORY_LABELS[cat] ?? cat,
      items: menuItems
        .filter((m) => m.category === cat && m.isActive !== false)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((m) => ({
          name: m.name,
          description: m.description || undefined,
          price: m.price,
        })),
    }))
    .filter((section) => section.items.length > 0);

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
          <Image src="/catering_menu_hero.webp" alt="Assorted catering dishes including pasta, steak, and chicken roulade" fill sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} priority />
        </div>
      </header>
      <MenuClient menuItems={menuItems} disclaimer={disclaimer} categoryOrder={categoryOrder} />
      <JsonLd data={menuNode(sections)} />
    </div>
  );
}
