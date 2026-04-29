'use server';

import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { revalidatePath } from 'next/cache';
import { Id } from '@/../convex/_generated/dataModel';
import { requireAdmin } from '@/lib/auth';

type ProductInput = {
  name: string;
  category: string;
  priceFrom: number;
  sizes?: { label: string; price: number }[];
  image?: string;
  isAvailable?: boolean;
  isLimitedEdition?: boolean;
  orderIndex?: number;
};

export async function addGuidosProduct(data: ProductInput) {
  await requireAdmin();
  if (!data.name || !data.category) {
    throw new Error('Name and category are required');
  }

  const id = await fetchMutation(api.guidosProducts.add, {
    name: data.name,
    category: data.category,
    priceFrom: data.priceFrom,
    sizes: data.sizes,
    image: data.image,
    isAvailable: data.isAvailable ?? true,
    isLimitedEdition: data.isLimitedEdition ?? false,
    orderIndex: data.orderIndex ?? 0,
  });

  revalidatePath('/admin/guidos-products');
  revalidatePath('/guidos/menu');
  revalidatePath('/guidos');

  return {
    id: id as string,
    name: data.name,
    category: data.category,
    priceFrom: data.priceFrom,
    sizes: data.sizes ?? [],
    image: data.image ?? '',
    isAvailable: data.isAvailable ?? true,
    isLimitedEdition: data.isLimitedEdition ?? false,
    orderIndex: data.orderIndex ?? 0,
  };
}

export async function updateGuidosProduct(id: string, data: ProductInput) {
  await requireAdmin();
  if (!id) throw new Error('Product ID is required');

  await fetchMutation(api.guidosProducts.update, {
    id: id as Id<"guidosProducts">,
    name: data.name,
    category: data.category,
    priceFrom: data.priceFrom,
    sizes: data.sizes,
    image: data.image,
    isAvailable: data.isAvailable ?? true,
    isLimitedEdition: data.isLimitedEdition ?? false,
    orderIndex: data.orderIndex ?? 0,
  });

  revalidatePath('/admin/guidos-products');
  revalidatePath('/guidos/menu');
  revalidatePath('/guidos');
}

export async function deleteGuidosProduct(id: string) {
  await requireAdmin();
  if (!id) throw new Error('Product ID is required');

  await fetchMutation(api.guidosProducts.remove, {
    id: id as Id<"guidosProducts">,
  });

  revalidatePath('/admin/guidos-products');
  revalidatePath('/guidos/menu');
  revalidatePath('/guidos');
  return { success: true };
}
