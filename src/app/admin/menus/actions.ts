'use server';

import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { revalidatePath, updateTag } from 'next/cache';
import { Id } from '@/../convex/_generated/dataModel';
import { requireAdmin } from '@/lib/auth';

type MenuItemInput = {
  category: string;
  name: string;
  description?: string;
  price?: number | null;
  priceLabel?: string;
  orderIndex?: number;
  isActive?: boolean;
  isFeatured?: boolean;
};

type MenuItemRecord = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number | null;
  priceLabel: string;
  orderIndex: number;
  isActive: boolean;
  isFeatured: boolean;
};

type ActionResult = { success: true } | { success: false; error: string };
type AddMenuItemResult = { success: true; item: MenuItemRecord } | { success: false; error: string };

// Public pages cache CMS reads under the 'cms' tag (see src/lib/cms.ts).
// updateTag expires it immediately (read-your-own-writes; the one-argument
// revalidateTag form is deprecated in this Next version).
function invalidatePublicCache() {
  updateTag('cms');
  revalidatePath('/', 'layout');
}

export async function addMenuItem(data: MenuItemInput): Promise<AddMenuItemResult> {
  await requireAdmin();
  if (!data.category || !data.name) {
    return { success: false, error: 'Category and name are required' };
  }

  try {
    const id = await fetchMutation(api.menuItems.add, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      category: data.category,
      name: data.name,
      description: data.description || '',
      price: data.price ?? undefined,
      priceLabel: data.priceLabel || 'Included',
      orderIndex: data.orderIndex || 0,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
    });

    await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: `Added menu item: ${data.name}`, section: 'Menu', details: data.category });
    revalidatePath('/admin/menus');
    revalidatePath('/menus');
    invalidatePublicCache();

    return {
      success: true,
      item: {
        id: id as string,
        category: data.category,
        name: data.name,
        description: data.description || '',
        price: data.price ?? null,
        priceLabel: data.priceLabel || 'Included',
        orderIndex: data.orderIndex || 0,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
      },
    };
  } catch (error) {
    console.error('Failed to add menu item:', error);
    return { success: false, error: 'Failed to add menu item' };
  }
}

export async function updateMenuItem(id: string, data: MenuItemInput): Promise<ActionResult> {
  await requireAdmin();
  if (!id) return { success: false, error: 'Item ID is required' };

  try {
    await fetchMutation(api.menuItems.update, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<"menuItems">,
      category: data.category,
      name: data.name,
      description: data.description || '',
      price: data.price ?? undefined,
      priceLabel: data.priceLabel || 'Included',
      orderIndex: data.orderIndex || 0,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
    });

    await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: `Updated menu item: ${data.name}`, section: 'Menu', details: data.category });
    revalidatePath('/admin/menus');
    revalidatePath('/menus');
    invalidatePublicCache();
    return { success: true };
  } catch (error) {
    console.error('Failed to update menu item:', error);
    return { success: false, error: 'Failed to update menu item' };
  }
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!id) return { success: false, error: 'Item ID is required' };

  try {
    await fetchMutation(api.menuItems.remove, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<"menuItems">,
    });

    await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: 'Deleted menu item', section: 'Menu' });
    revalidatePath('/admin/menus');
    revalidatePath('/menus');
    invalidatePublicCache();
    return { success: true };
  } catch (error) {
    console.error('Failed to delete menu item:', error);
    return { success: false, error: 'Failed to delete menu item' };
  }
}
