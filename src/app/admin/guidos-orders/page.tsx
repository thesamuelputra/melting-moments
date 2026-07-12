import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { ToastProvider } from '../_components';
import AdminGuidosOrdersClient from './AdminGuidosOrdersClient';

export default async function GuidosOrdersAdminPage() {
  // Newest first: guidosOrders.list returns by_submittedAt DESC.
  const items = await fetchQuery(api.guidosOrders.list, { adminSecret: process.env.ADMIN_PASSWORD! });

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

  return (
    <ToastProvider>
      <AdminGuidosOrdersClient initialOrders={orders} />
    </ToastProvider>
  );
}
