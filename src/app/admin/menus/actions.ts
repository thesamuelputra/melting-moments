'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

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
  if (!data.category || !data.name) {
    throw new Error('Category and name are required');
  }

  const item = await db.menuItem.create({
    data: {
      category: data.category,
      name: data.name,
      description: data.description || '',
      price: data.price ?? null,
      priceLabel: data.priceLabel || 'Included',
      orderIndex: data.orderIndex || 0,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
    }
  });
  revalidatePath('/admin/menus');
  revalidatePath('/menus');
  return item;
}

export async function updateMenuItem(id: string, data: MenuItemInput) {
  if (!id) throw new Error('Item ID is required');

  const item = await db.menuItem.update({
    where: { id },
    data: {
      category: data.category,
      name: data.name,
      description: data.description || '',
      price: data.price ?? null,
      priceLabel: data.priceLabel || 'Included',
      orderIndex: data.orderIndex || 0,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
    }
  });
  revalidatePath('/admin/menus');
  revalidatePath('/menus');
  return item;
}

export async function deleteMenuItem(id: string) {
  if (!id) throw new Error('Item ID is required');
  
  await db.menuItem.delete({ where: { id } });
  revalidatePath('/admin/menus');
  revalidatePath('/menus');
  return { success: true };
}
