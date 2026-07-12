import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminMenuClient from './AdminMenuClient';

export default async function MenusAdminPage() {
  const [items, settings] = await Promise.all([
    fetchQuery(api.menuItems.list, { adminSecret: process.env.ADMIN_PASSWORD! }),
    fetchQuery(api.businessSettings.getAll),
  ]);

  // Serialize for the client component
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

  // Curated public section order (comma-separated). Empty → alphabetical default
  // (the Convex list query already sorts by category ASC).
  const savedCategoryOrder = (settings['menu_category_order'] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return <AdminMenuClient initialItems={menuItems} savedCategoryOrder={savedCategoryOrder} />;
}
