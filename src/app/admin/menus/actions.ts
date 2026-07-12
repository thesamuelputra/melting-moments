'use server';

import { fetchMutation } from 'convex/nextjs';
import { revalidatePath, updateTag } from 'next/cache';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { AdminAuthError, requireAdmin } from '@/lib/auth';

export type ActionFailure = {
  success: false;
  error: 'unauthorized' | 'invalid' | 'failed';
  message?: string;
};

export type ActionResult = { success: true; id?: string } | ActionFailure;

/** Bulk delete reports per-item failures so the client can restore only those rows. */
export type BulkDeleteResult = { success: true } | (ActionFailure & { failedIds?: string[] });

/**
 * Full editable field set for create/edit. Never carries orderIndex:
 * - add: the Convex mutation appends (max(orderIndex) + 1 within the category);
 * - update: the Convex partial patch leaves orderIndex untouched when omitted.
 */
export type MenuItemInput = {
  category: string;
  name: string;
  description: string;
  price: number | null;
  priceLabel: string;
  isActive: boolean;
  isFeatured: boolean;
};

// Public pages cache CMS reads under the 'cms' tag (src/lib/cms.ts).
// updateTag expires it immediately (read-your-own-writes; one-arg revalidateTag
// is deprecated in this Next version). revalidatePath('/', 'layout') refreshes
// every public route; /admin/menus renders server data so it is refreshed too.
function invalidateMenus(): void {
  updateTag('cms');
  revalidatePath('/', 'layout');
  revalidatePath('/admin/menus');
}

/** Map AdminAuthError → 'unauthorized'; rethrow real server misconfig (env unset). */
async function guard(): Promise<ActionFailure | null> {
  try {
    await requireAdmin();
    return null;
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return { success: false, error: 'unauthorized' };
    }
    throw err;
  }
}

function failureFrom(error: unknown, fallbackMessage: string): ActionFailure {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('Unauthorized')) {
    return { success: false, error: 'unauthorized' };
  }
  console.error(`[admin/menus] ${fallbackMessage}:`, error);
  return { success: false, error: 'failed', message: fallbackMessage };
}

type NormalizedInput = {
  category: string;
  name: string;
  description: string;
  price: number | null;
  priceLabel: string;
  isActive: boolean;
  isFeatured: boolean;
};

function normalizeItemInput(
  input: MenuItemInput
): { ok: true; value: NormalizedInput } | { ok: false; message: string } {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const category = typeof input.category === 'string' ? input.category.trim() : '';
  if (!name) return { ok: false, message: 'Name is required' };
  if (!category) return { ok: false, message: 'Category is required' };
  // menu_category_order is stored comma-joined; a comma in a category name
  // would make that category impossible to reorder later.
  if (category.includes(',')) return { ok: false, message: 'Category names cannot contain commas' };
  if (input.price !== null && (!Number.isFinite(input.price) || input.price < 0)) {
    return { ok: false, message: 'Price must be a non-negative number' };
  }
  return {
    ok: true,
    value: {
      category,
      name,
      description: typeof input.description === 'string' ? input.description.trim() : '',
      price: input.price,
      priceLabel:
        (typeof input.priceLabel === 'string' ? input.priceLabel.trim() : '') || 'Included',
      isActive: input.isActive === true,
      isFeatured: input.isFeatured === true,
    },
  };
}

export async function addMenuItem(input: MenuItemInput): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const parsed = normalizeItemInput(input);
  if (!parsed.ok) return { success: false, error: 'invalid', message: parsed.message };
  const value = parsed.value;

  try {
    const id = await fetchMutation(api.menuItems.add, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      category: value.category,
      name: value.name,
      description: value.description,
      price: value.price ?? undefined,
      priceLabel: value.priceLabel,
      isActive: value.isActive,
      isFeatured: value.isFeatured,
      // orderIndex intentionally omitted; the backend appends within the category.
    });
    invalidateMenus();
    return { success: true, id: id as string };
  } catch (error) {
    return failureFrom(error, 'Failed to add the menu item');
  }
}

export async function updateMenuItem(id: string, input: MenuItemInput): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  if (!id) return { success: false, error: 'invalid', message: 'Item id is required' };

  const parsed = normalizeItemInput(input);
  if (!parsed.ok) return { success: false, error: 'invalid', message: parsed.message };
  const value = parsed.value;

  try {
    await fetchMutation(api.menuItems.update, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'menuItems'>,
      category: value.category,
      name: value.name,
      description: value.description,
      price: value.price, // null clears the stored price
      priceLabel: value.priceLabel,
      isActive: value.isActive,
      isFeatured: value.isFeatured,
      // orderIndex intentionally omitted; the partial patch keeps the stored value.
    });
    invalidateMenus();
    return { success: true };
  } catch (error) {
    return failureFrom(error, 'Failed to save the menu item');
  }
}

/** Single-field toggle: sends only the changed flag (partial-patch semantics). */
export async function setMenuItemFlag(
  id: string,
  flag: 'isActive' | 'isFeatured',
  enabled: boolean
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  if (!id) return { success: false, error: 'invalid', message: 'Item id is required' };

  try {
    await fetchMutation(api.menuItems.update, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'menuItems'>,
      ...(flag === 'isActive' ? { isActive: enabled } : { isFeatured: enabled }),
    });
    invalidateMenus();
    return { success: true };
  } catch (error) {
    return failureFrom(error, 'Failed to update the item');
  }
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  if (!id) return { success: false, error: 'invalid', message: 'Item id is required' };

  try {
    await fetchMutation(api.menuItems.remove, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'menuItems'>,
    });
    invalidateMenus();
    return { success: true };
  } catch (error) {
    return failureFrom(error, 'Failed to delete the item');
  }
}

/**
 * One server action for bulk delete. No bulk mutation exists in the Convex API,
 * so it fans out remove calls with Promise.allSettled and reports which ids
 * failed so the client can restore exactly those rows.
 */
export async function bulkDeleteMenuItems(ids: string[]): Promise<BulkDeleteResult> {
  const denied = await guard();
  if (denied) return denied;

  const unique = Array.from(new Set(ids)).filter(Boolean);
  if (unique.length === 0) {
    return { success: false, error: 'invalid', message: 'No items selected' };
  }

  const results = await Promise.allSettled(
    unique.map((id) =>
      fetchMutation(api.menuItems.remove, {
        adminSecret: process.env.ADMIN_PASSWORD!,
        id: id as Id<'menuItems'>,
      })
    )
  );

  const failedIds = unique.filter((_, i) => results[i].status === 'rejected');
  if (failedIds.length < unique.length) invalidateMenus();
  if (failedIds.length === 0) return { success: true };

  const firstRejection = results.find(
    (r): r is PromiseRejectedResult => r.status === 'rejected'
  );
  const reason = firstRejection?.reason;
  const reasonMessage = reason instanceof Error ? reason.message : '';
  if (reasonMessage.includes('Unauthorized')) {
    return { success: false, error: 'unauthorized', failedIds };
  }
  console.error('[admin/menus] Bulk delete failures:', failedIds, reason);
  return {
    success: false,
    error: 'failed',
    message: `Failed to delete ${failedIds.length} of ${unique.length} item${unique.length === 1 ? '' : 's'}`,
    failedIds,
  };
}

/** Persist a category's full drag-and-drop order atomically (single transaction). */
export async function reorderMenuItems(category: string, ids: string[]): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const cat = typeof category === 'string' ? category.trim() : '';
  if (!cat) return { success: false, error: 'invalid', message: 'Category is required' };
  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: false, error: 'invalid', message: 'Nothing to reorder' };
  }

  try {
    await fetchMutation(api.menuItems.reorder, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      category: cat,
      ids: ids as Id<'menuItems'>[],
    });
    invalidateMenus();
    return { success: true };
  } catch (error) {
    return failureFrom(error, 'Could not save the new order');
  }
}

/** Persist the public section order to businessSettings.menu_category_order. */
export async function saveCategoryOrder(categories: string[]): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const cleaned = Array.from(
    new Set((Array.isArray(categories) ? categories : []).map((c) => c.trim()).filter(Boolean))
  );
  if (cleaned.length === 0) {
    return { success: false, error: 'invalid', message: 'Category list is empty' };
  }
  if (cleaned.some((c) => c.includes(','))) {
    // The setting is comma-separated; a comma inside a name would corrupt it.
    return { success: false, error: 'invalid', message: 'Category names cannot contain commas' };
  }

  try {
    await fetchMutation(api.businessSettings.save, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      entries: [{ key: 'menu_category_order', value: cleaned.join(',') }],
      activity: {
        action: 'Reordered menu categories',
        section: 'Menu',
        details: cleaned.join(', ').slice(0, 80),
      },
    });
    invalidateMenus();
    return { success: true };
  } catch (error) {
    return failureFrom(error, 'Could not save the category order');
  }
}
