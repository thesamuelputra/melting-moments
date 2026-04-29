import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import AdminGuidosOrdersClient from './AdminGuidosOrdersClient';

export default async function GuidosOrdersAdminPage() {
  const items = await fetchQuery(api.guidosOrders.list);

  const orders = items.map((item) => ({
    id: item._id,
    customerName: item.customerName,
    customerEmail: item.customerEmail,
    customerPhone: item.customerPhone,
    items: item.items,
    deliveryMethod: item.deliveryMethod,
    deliveryAddress: item.deliveryAddress ?? '',
    notes: item.notes ?? '',
    status: item.status,
    submittedAt: item.submittedAt,
  }));

  return <AdminGuidosOrdersClient initialOrders={orders} />;
}
