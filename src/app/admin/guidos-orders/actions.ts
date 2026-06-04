'use server';

import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { revalidatePath } from 'next/cache';
import { Id } from '@/../convex/_generated/dataModel';
import { requireAdmin } from '@/lib/auth';

export async function updateGuidosOrderStatus(id: string, status: string) {
  await requireAdmin();
  if (!id) throw new Error('Order ID is required');

  await fetchMutation(api.guidosOrders.updateStatus, {
    adminSecret: process.env.ADMIN_PASSWORD!,
    id: id as Id<"guidosOrders">,
    status,
  });

  revalidatePath('/admin/guidos-orders');
  await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: `Updated Guido's order status to ${status}`, section: "Guido's Orders" });
}

export async function deleteGuidosOrder(id: string) {
  await requireAdmin();
  if (!id) throw new Error('Order ID is required');

  await fetchMutation(api.guidosOrders.remove, {
    adminSecret: process.env.ADMIN_PASSWORD!,
    id: id as Id<"guidosOrders">,
  });

  revalidatePath('/admin/guidos-orders');
  await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: "Deleted Guido's order", section: "Guido's Orders" });
  return { success: true };
}
