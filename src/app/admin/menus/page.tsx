import AdminMenuClient from './AdminMenuClient';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function MenusAdminPage() {
  const items = await db.menuItem.findMany({
    orderBy: [
      { category: 'asc' },
      { orderIndex: 'asc' }
    ]
  });
  
  return <AdminMenuClient initialItems={items} />;
}
