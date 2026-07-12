'use server';

import { fetchMutation } from 'convex/nextjs';
import { revalidatePath } from 'next/cache';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { requireAdmin, AdminAuthError } from '@/lib/auth';

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: 'unauthorized' | 'invalid' | 'failed'; message?: string };

/** Mirrors ORDER_STATUSES in convex/lib.ts; the mutation arg is this literal union. */
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivered' | 'picked_up';

const ORDER_STATUSES: readonly OrderStatus[] = ['received', 'preparing', 'ready', 'delivered', 'picked_up'];

const UNAUTHORIZED = { success: false, error: 'unauthorized' } as const;

async function ensureAdmin(): Promise<ActionResult | null> {
  try {
    await requireAdmin();
    return null;
  } catch (err) {
    if (err instanceof AdminAuthError) return UNAUTHORIZED;
    throw err; // ADMIN_PASSWORD unset: real server misconfig, let it surface
  }
}

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
