'use server';

import { fetchMutation } from 'convex/nextjs';
import { revalidatePath, updateTag } from 'next/cache';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { requireAdmin, AdminAuthError } from '@/lib/auth';

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: 'unauthorized' | 'invalid' | 'failed'; message?: string };

export type SizeInput = { label: string; price: number };

export type ProductCreateInput = {
  name: string;
  category: string;
  priceFrom: number;
  sizes?: SizeInput[];
  image?: string;
  isAvailable?: boolean;
  isLimitedEdition?: boolean;
};

/** Partial patch; omitted fields are left untouched server-side. */
export type ProductPatchInput = {
  name?: string;
  category?: string;
  priceFrom?: number;
  /** null clears all size variants. */
  sizes?: SizeInput[] | null;
  /** null (or '') clears the image. */
  image?: string | null;
  isAvailable?: boolean;
  isLimitedEdition?: boolean;
};

const UNAUTHORIZED = { success: false, error: 'unauthorized' } as const;

function invalid(message: string): ActionResult {
  return { success: false, error: 'invalid', message };
}

async function ensureAdmin(): Promise<ActionResult | null> {
  try {
    await requireAdmin();
    return null;
  } catch (err) {
    if (err instanceof AdminAuthError) return UNAUTHORIZED;
    throw err; // ADMIN_PASSWORD unset: real server misconfig, let it surface
  }
}

/** Site-relative ('/...') or https:// URLs only. Empty string means "no image". */
function isValidImageRef(image: string): boolean {
  return image === '' || image.startsWith('/') || image.startsWith('https://');
}

function validateSizes(sizes: SizeInput[]): string | null {
  for (const size of sizes) {
    if (!size.label.trim()) return 'Every size needs a label';
    if (!Number.isFinite(size.price) || size.price <= 0) {
      return 'Every size price must be greater than 0';
    }
  }
  return null;
}

function invalidateProductCaches(): void {
  updateTag('cms');
  revalidatePath('/', 'layout');
  revalidatePath('/admin/guidos-products');
}

export async function addGuidosProduct(input: ProductCreateInput): Promise<ActionResult> {
  const auth = await ensureAdmin();
  if (auth) return auth;

  if (!input.name.trim()) return invalid('Name is required');
  if (!input.category.trim()) return invalid('Category is required');
  if (!Number.isFinite(input.priceFrom) || input.priceFrom < 0) {
    return invalid('Enter a valid "from" price');
  }
  if (input.sizes !== undefined) {
    const sizeError = validateSizes(input.sizes);
    if (sizeError) return invalid(sizeError);
  }
  if (input.image !== undefined && !isValidImageRef(input.image)) {
    return invalid('Image must be a site path (/...) or an https:// URL');
  }

  try {
    const id = await fetchMutation(api.guidosProducts.add, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      name: input.name,
      category: input.category,
      priceFrom: input.priceFrom,
      // orderIndex omitted on purpose: the mutation appends to the end of the category.
      ...(input.sizes !== undefined && input.sizes.length > 0 ? { sizes: input.sizes } : {}),
      ...(input.image ? { image: input.image } : {}),
      ...(input.isAvailable !== undefined ? { isAvailable: input.isAvailable } : {}),
      ...(input.isLimitedEdition !== undefined ? { isLimitedEdition: input.isLimitedEdition } : {}),
    });
    invalidateProductCaches();
    return { success: true, id: id as string };
  } catch {
    return { success: false, error: 'failed', message: 'Could not add the product' };
  }
}

export async function updateGuidosProduct(id: string, patch: ProductPatchInput): Promise<ActionResult> {
  const auth = await ensureAdmin();
  if (auth) return auth;

  if (!id) return invalid('Product ID is required');
  if (patch.name !== undefined && !patch.name.trim()) return invalid('Name is required');
  if (patch.category !== undefined && !patch.category.trim()) return invalid('Category is required');
  if (patch.priceFrom !== undefined && (!Number.isFinite(patch.priceFrom) || patch.priceFrom < 0)) {
    return invalid('Enter a valid "from" price');
  }
  if (patch.sizes !== undefined && patch.sizes !== null) {
    const sizeError = validateSizes(patch.sizes);
    if (sizeError) return invalid(sizeError);
  }
  if (patch.image !== undefined && patch.image !== null && !isValidImageRef(patch.image)) {
    return invalid('Image must be a site path (/...) or an https:// URL');
  }

  // Partial-patch semantics: only send fields the caller explicitly set;
  // the backend never resets omitted fields.
  const fields = {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.category !== undefined ? { category: patch.category } : {}),
    ...(patch.priceFrom !== undefined ? { priceFrom: patch.priceFrom } : {}),
    ...(patch.sizes !== undefined
      ? { sizes: patch.sizes === null || patch.sizes.length === 0 ? null : patch.sizes }
      : {}),
    ...(patch.image !== undefined ? { image: patch.image === null || patch.image === '' ? null : patch.image } : {}),
    ...(patch.isAvailable !== undefined ? { isAvailable: patch.isAvailable } : {}),
    ...(patch.isLimitedEdition !== undefined ? { isLimitedEdition: patch.isLimitedEdition } : {}),
  };
  if (Object.keys(fields).length === 0) return { success: true };

  try {
    await fetchMutation(api.guidosProducts.update, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'guidosProducts'>,
      ...fields,
    });
    invalidateProductCaches();
    return { success: true, id };
  } catch {
    return { success: false, error: 'failed', message: 'Could not save the product' };
  }
}

export async function deleteGuidosProduct(id: string): Promise<ActionResult> {
  const auth = await ensureAdmin();
  if (auth) return auth;
  if (!id) return invalid('Product ID is required');

  try {
    await fetchMutation(api.guidosProducts.remove, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'guidosProducts'>,
    });
    invalidateProductCaches();
    return { success: true };
  } catch {
    return { success: false, error: 'failed', message: 'Could not delete the product' };
  }
}

/** Atomic category-scoped reorder; pass the complete ordered id list for that category. */
export async function reorderGuidosProducts(category: string, ids: string[]): Promise<ActionResult> {
  const auth = await ensureAdmin();
  if (auth) return auth;
  if (!category.trim()) return invalid('Category is required');
  if (ids.length === 0) return { success: true };

  try {
    await fetchMutation(api.guidosProducts.reorder, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      category,
      ids: ids as Id<'guidosProducts'>[],
    });
    invalidateProductCaches();
    return { success: true };
  } catch {
    return { success: false, error: 'failed', message: 'Could not save the new order' };
  }
}
