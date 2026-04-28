'use server';

import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { revalidatePath } from 'next/cache';
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

export async function addMenuItem(data: MenuItemInput) {
  await requireAdmin();
  if (!data.category || !data.name) {
    throw new Error('Category and name are required');
  }

  const id = await fetchMutation(api.menuItems.add, {
    category: data.category,
    name: data.name,
    description: data.description || '',
    price: data.price ?? undefined,
    priceLabel: data.priceLabel || 'Included',
    orderIndex: data.orderIndex || 0,
    isActive: data.isActive ?? true,
    isFeatured: data.isFeatured ?? false,
  });

  revalidatePath('/admin/menus');
  revalidatePath('/menus');

  return {
    id: id as string,
    category: data.category,
    name: data.name,
    description: data.description || '',
    price: data.price ?? null,
    priceLabel: data.priceLabel || 'Included',
    orderIndex: data.orderIndex || 0,
    isActive: data.isActive ?? true,
    isFeatured: data.isFeatured ?? false,
  };
}

export async function updateMenuItem(id: string, data: MenuItemInput) {
  await requireAdmin();
  if (!id) throw new Error('Item ID is required');

  await fetchMutation(api.menuItems.update, {
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

  revalidatePath('/admin/menus');
  revalidatePath('/menus');
}

export async function deleteMenuItem(id: string) {
  await requireAdmin();
  if (!id) throw new Error('Item ID is required');
  
  await fetchMutation(api.menuItems.remove, {
    id: id as Id<"menuItems">,
  });

  revalidatePath('/admin/menus');
  revalidatePath('/menus');
  return { success: true };
}
