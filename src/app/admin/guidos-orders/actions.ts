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
    id: id as Id<"guidosOrders">,
    status,
  });

  revalidatePath('/admin/guidos-orders');
}

export async function deleteGuidosOrder(id: string) {
  await requireAdmin();
  if (!id) throw new Error('Order ID is required');

  await fetchMutation(api.guidosOrders.remove, {
    id: id as Id<"guidosOrders">,
  });

  revalidatePath('/admin/guidos-orders');
  return { success: true };
}
