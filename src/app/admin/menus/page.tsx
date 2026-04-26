import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminMenuClient from './AdminMenuClient';

export default async function MenusAdminPage() {
  const items = await fetchQuery(api.menuItems.list);
  
  // Serialize for client
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

  return <AdminMenuClient initialItems={menuItems} />;
}
