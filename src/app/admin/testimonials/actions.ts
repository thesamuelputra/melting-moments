'use server';

import { fetchMutation } from 'convex/nextjs';
import { revalidatePath, updateTag } from 'next/cache';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { AdminAuthError, requireAdmin } from '@/lib/auth';

export type TestimonialBrand = 'catering' | 'guidos';

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: 'unauthorized' | 'invalid' | 'failed'; message?: string };

const MAX_AUTHOR = 120;
const MAX_ROLE = 160;
const MAX_TEXT = 2000;

const unauthorized = { success: false, error: 'unauthorized' } as const;
const failed = (message: string) => ({ success: false as const, error: 'failed' as const, message });
const invalid = (message: string) => ({ success: false as const, error: 'invalid' as const, message });

/** Maps AdminAuthError → 'unauthorized'. A missing ADMIN_PASSWORD env (plain
 *  Error) is a server misconfiguration and is intentionally rethrown. */
async function guard(): Promise<typeof unauthorized | null> {
  try {
    await requireAdmin();
    return null;
  } catch (err) {
    if (err instanceof AdminAuthError) return unauthorized;
    throw err;
  }
}

// Public pages cache CMS reads under the 'cms' tag (src/lib/cms.ts);
// updateTag expires it immediately (read-your-own-writes). The layout
// revalidate covers every public route; /admin/testimonials re-fetches
// its server data.
function invalidateTestimonialCaches() {
  updateTag('cms');
  revalidatePath('/', 'layout');
  revalidatePath('/admin/testimonials');
}

function isBrand(value: unknown): value is TestimonialBrand {
  return value === 'catering' || value === 'guidos';
}

function isValidRating(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export async function createTestimonial(data: {
  author: string;
  text: string;
  role?: string;
  /** Omit for "no rating". */
  rating?: number;
  /** Omit for "shown on both brands". */
  brand?: TestimonialBrand;
}): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const author = data.author?.trim() ?? '';
  const text = data.text?.trim() ?? '';
  const role = data.role?.trim();
  if (!author) return invalid('Author is required');
  if (!text) return invalid('Testimonial text is required');
  if (author.length > MAX_AUTHOR) return invalid(`Author must be ${MAX_AUTHOR} characters or fewer`);
  if (text.length > MAX_TEXT) return invalid(`Text must be ${MAX_TEXT} characters or fewer`);
  if (role !== undefined && role.length > MAX_ROLE) return invalid(`Role must be ${MAX_ROLE} characters or fewer`);
  if (data.rating !== undefined && !isValidRating(data.rating)) return invalid('Rating must be a whole number from 1 to 5');
  if (data.brand !== undefined && !isBrand(data.brand)) return invalid('Unknown brand');

  try {
    const id = await fetchMutation(api.testimonials.create, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      author,
      text,
      ...(role ? { role } : {}),
      ...(data.rating !== undefined ? { rating: data.rating } : {}),
      ...(data.brand !== undefined ? { brand: data.brand } : {}),
    });
    invalidateTestimonialCaches();
    return { success: true, id: id as string };
  } catch {
    return failed('Could not save the testimonial');
  }
}

export async function updateTestimonial(
  id: string,
  fields: {
    author?: string;
    text?: string;
    /** null clears the role. */
    role?: string | null;
    /** null clears the rating ("no rating"). */
    rating?: number | null;
    /** null clears the brand (shown on both). */
    brand?: TestimonialBrand | null;
    isActive?: boolean;
  }
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const patch: {
    author?: string;
    text?: string;
    role?: string | null;
    rating?: number | null;
    brand?: TestimonialBrand | null;
    isActive?: boolean;
  } = {};

  if (fields.author !== undefined) {
    const author = fields.author.trim();
    if (!author) return invalid('Author is required');
    if (author.length > MAX_AUTHOR) return invalid(`Author must be ${MAX_AUTHOR} characters or fewer`);
    patch.author = author;
  }
  if (fields.text !== undefined) {
    const text = fields.text.trim();
    if (!text) return invalid('Testimonial text is required');
    if (text.length > MAX_TEXT) return invalid(`Text must be ${MAX_TEXT} characters or fewer`);
    patch.text = text;
  }
  if (fields.role !== undefined) {
    const role = fields.role === null ? null : fields.role.trim();
    if (role !== null && role.length > MAX_ROLE) return invalid(`Role must be ${MAX_ROLE} characters or fewer`);
    patch.role = role === '' ? null : role;
  }
  if (fields.rating !== undefined) {
    if (fields.rating !== null && !isValidRating(fields.rating)) {
      return invalid('Rating must be a whole number from 1 to 5');
    }
    patch.rating = fields.rating;
  }
  if (fields.brand !== undefined) {
    if (fields.brand !== null && !isBrand(fields.brand)) return invalid('Unknown brand');
    patch.brand = fields.brand;
  }
  if (fields.isActive !== undefined) patch.isActive = fields.isActive;
  if (Object.keys(patch).length === 0) return { success: true };

  try {
    // Partial patch: only the provided fields are sent, so omitted fields
    // are never reset server-side (convex/testimonials.ts update semantics).
    await fetchMutation(api.testimonials.update, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'testimonials'>,
      ...patch,
    });
    invalidateTestimonialCaches();
    return { success: true };
  } catch {
    return failed('Could not update the testimonial');
  }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  try {
    await fetchMutation(api.testimonials.remove, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'testimonials'>,
    });
    invalidateTestimonialCaches();
    return { success: true };
  } catch {
    return failed('Could not delete the testimonial');
  }
}

/** Atomic whole-table reorder: pass the COMPLETE ordered id list. */
export async function reorderTestimonials(ids: string[]): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (ids.length === 0) return { success: true };

  try {
    await fetchMutation(api.testimonials.reorder, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      ids: ids as Id<'testimonials'>[],
    });
    invalidateTestimonialCaches();
    return { success: true };
  } catch {
    return failed('Could not save the new order');
  }
}
