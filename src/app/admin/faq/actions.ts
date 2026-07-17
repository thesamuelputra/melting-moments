'use server';

import { fetchMutation } from 'convex/nextjs';
import { revalidatePath, updateTag } from 'next/cache';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { AdminAuthError, requireAdmin } from '@/lib/auth';
import { FALLBACK_FAQS } from '@/lib/fallback-faqs';

export type FaqCategory = 'catering' | 'guidos';

export type ActionResult =
  | { success: true; id?: string; seeded?: boolean }
  | { success: false; error: 'unauthorized' | 'invalid' | 'failed'; message?: string };

const MAX_QUESTION = 300;
const MAX_ANSWER = 2000;

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
// updateTag expires it immediately (read-your-own-writes; the deprecated
// one-arg revalidateTag is intentionally not used). revalidatePath('/',
// 'layout') covers every public route; /admin/faq re-fetches its server data.
function invalidateFaqCaches() {
  updateTag('cms');
  revalidatePath('/', 'layout');
  revalidatePath('/admin/faq');
}

function isCategory(value: unknown): value is FaqCategory {
  return value === 'catering' || value === 'guidos';
}

export async function createFaq(data: {
  question: string;
  answer: string;
  category?: FaqCategory;
}): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const question = data.question?.trim() ?? '';
  const answer = data.answer?.trim() ?? '';
  if (!question) return invalid('Question is required');
  if (!answer) return invalid('Answer is required');
  if (question.length > MAX_QUESTION) return invalid(`Question must be ${MAX_QUESTION} characters or fewer`);
  if (answer.length > MAX_ANSWER) return invalid(`Answer must be ${MAX_ANSWER} characters or fewer`);
  if (data.category !== undefined && !isCategory(data.category)) return invalid('Unknown category');

  try {
    // First write into an empty table imports the starter FAQs: the public
    // /faq fallback is all-or-nothing (any CMS row replaces all the built-in
    // questions), so without this a single new FAQ would silently drop the
    // other section's content from the live site and its JSON-LD. The seed
    // mutation is a single transaction and a no-op when rows already exist.
    const seededCount = await fetchMutation(api.faqs.seedStarters, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      items: FALLBACK_FAQS,
    });
    const seeded = seededCount > 0;

    const id = await fetchMutation(api.faqs.create, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      question,
      answer,
      ...(data.category !== undefined ? { category: data.category } : {}),
    });
    invalidateFaqCaches();
    return { success: true, id: id as string, seeded };
  } catch {
    return failed('Could not save the FAQ');
  }
}

/**
 * Import the starter questions into an empty FAQ table. Atomic and
 * idempotent: repeat calls (or a race with a first create) import nothing.
 */
export async function seedStarterFaqs(): Promise<
  { success: true; count: number } | Exclude<ActionResult, { success: true }>
> {
  const denied = await guard();
  if (denied) return denied;

  try {
    const count = await fetchMutation(api.faqs.seedStarters, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      items: FALLBACK_FAQS,
    });
    if (count === 0) {
      return invalid('The FAQ list already has entries, so there is nothing to import');
    }
    invalidateFaqCaches();
    return { success: true, count };
  } catch {
    return failed('Could not import the starter FAQs');
  }
}

export async function updateFaq(
  id: string,
  fields: {
    question?: string;
    answer?: string;
    /** null clears the category (general FAQ, shown under Catering). */
    category?: FaqCategory | null;
    isActive?: boolean;
  }
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const patch: {
    question?: string;
    answer?: string;
    category?: FaqCategory | null;
    isActive?: boolean;
  } = {};

  if (fields.question !== undefined) {
    const question = fields.question.trim();
    if (!question) return invalid('Question is required');
    if (question.length > MAX_QUESTION) return invalid(`Question must be ${MAX_QUESTION} characters or fewer`);
    patch.question = question;
  }
  if (fields.answer !== undefined) {
    const answer = fields.answer.trim();
    if (!answer) return invalid('Answer is required');
    if (answer.length > MAX_ANSWER) return invalid(`Answer must be ${MAX_ANSWER} characters or fewer`);
    patch.answer = answer;
  }
  if (fields.category !== undefined) {
    if (fields.category !== null && !isCategory(fields.category)) return invalid('Unknown category');
    patch.category = fields.category;
  }
  if (fields.isActive !== undefined) patch.isActive = fields.isActive;
  if (Object.keys(patch).length === 0) return { success: true };

  try {
    // Partial patch: only the provided fields are sent, so omitted fields
    // are never reset server-side (convex/faqs.ts update semantics).
    await fetchMutation(api.faqs.update, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'faqs'>,
      ...patch,
    });
    invalidateFaqCaches();
    return { success: true };
  } catch {
    return failed('Could not update the FAQ');
  }
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  try {
    await fetchMutation(api.faqs.remove, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      id: id as Id<'faqs'>,
    });
    invalidateFaqCaches();
    return { success: true };
  } catch {
    return failed('Could not delete the FAQ');
  }
}

/** Atomic whole-table reorder: the id list must be complete and in order. */
export async function reorderFaqs(ids: string[]): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (ids.length === 0) return { success: true };

  try {
    await fetchMutation(api.faqs.reorder, {
      adminSecret: process.env.ADMIN_PASSWORD!,
      ids: ids as Id<'faqs'>[],
    });
    invalidateFaqCaches();
    return { success: true };
  } catch {
    return failed('Could not save the new order');
  }
}
