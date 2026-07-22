'use server';

import { fetchMutation } from 'convex/nextjs';
import { revalidatePath } from 'next/cache';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { ORDER_STATUSES, type OrderStatus } from '@/../convex/statuses';
import { ensureAdmin, type ActionResult } from '@/lib/admin-actions';

export type { ActionResult } from '@/lib/admin-actions';
export type { OrderStatus } from '@/../convex/statuses';

// Orders never appear on the public site, so there is no updateTag('cms')
// here on purpose; only the admin orders page needs revalidating.

export async function updateGuidosOrderStatus(id: string, status: OrderStatus): Promise<ActionResult> {
  const auth = await ensureAdmin();
  if (auth) return auth;
  if (!id) return { success: false, error: 'invalid', message: 'Order ID is required' };
  if (!ORDER_STATUSES.includes(status)) {
    return { success: false, error: 'invalid', message: 'Unknown order status' };
  }

  try {
    await fetchMutation(api.guidosOrders.updateStatus, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'guidosOrders'>,
      status,
    });
    revalidatePath('/admin/guidos-orders');
    return { success: true, id };
  } catch {
    return { success: false, error: 'failed', message: 'Could not update the order status' };
  }
}

export async function deleteGuidosOrder(id: string): Promise<ActionResult> {
  const auth = await ensureAdmin();
  if (auth) return auth;
  if (!id) return { success: false, error: 'invalid', message: 'Order ID is required' };

  try {
    await fetchMutation(api.guidosOrders.remove, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'guidosOrders'>,
    });
    revalidatePath('/admin/guidos-orders');
    return { success: true };
  } catch {
    return { success: false, error: 'failed', message: 'Could not delete the order' };
  }
}
