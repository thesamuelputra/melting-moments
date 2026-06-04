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
    adminSecret: process.env.ADMIN_PASSWORD!,
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
  await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: `Added Guido's product: ${data.name}`, section: "Guido's Products", details: data.category });

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
    adminSecret: process.env.ADMIN_PASSWORD!,
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
  await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: `Updated Guido's product: ${data.name}`, section: "Guido's Products", details: data.category });
}

export async function deleteGuidosProduct(id: string) {
  await requireAdmin();
  if (!id) throw new Error('Product ID is required');

  await fetchMutation(api.guidosProducts.remove, {
    adminSecret: process.env.ADMIN_PASSWORD!,
    id: id as Id<"guidosProducts">,
  });

  revalidatePath('/admin/guidos-products');
  revalidatePath('/guidos/menu');
  revalidatePath('/guidos');
  await fetchMutation(api.activityLog.log, { adminSecret: process.env.ADMIN_PASSWORD!, action: "Deleted Guido's product", section: "Guido's Products" });
  return { success: true };
}
