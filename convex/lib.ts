import type { MutationCtx } from "./_generated/server";

/**
 * Single source of truth for admin auth on Convex functions.
 * Fails closed: if ADMIN_PASSWORD is unset on the deployment, every call is rejected.
 */
export function assertAdmin(secret: string | undefined): void {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || secret !== expected) {
    throw new Error("Unauthorized");
  }
}

// Status enums live in ./statuses so Next.js code can import them without
// pulling in Convex server internals; re-exported here so existing convex
// imports keep working.
export {
  INQUIRY_STATUSES,
  ORDER_STATUSES,
  type InquiryStatus,
  type OrderStatus,
} from "./statuses";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const PRUNE_BATCH_SIZE = 25;

/**
 * Insert an activity-log entry inside the calling mutation's transaction
 * (atomic with the entity change), then prune a bounded batch of entries
 * older than 90 days so log writes never trigger unbounded work.
 */
export async function logActivity(
  ctx: MutationCtx,
  entry: { action: string; section: string; details?: string }
): Promise<void> {
  const now = Date.now();
  await ctx.db.insert("activityLog", {
    action: entry.action,
    section: entry.section,
    details: entry.details,
    performedAt: now,
  });

  const cutoff = now - NINETY_DAYS_MS;
  const stale = await ctx.db
    .query("activityLog")
    .withIndex("by_performedAt", (q) => q.lt("performedAt", cutoff))
    .take(PRUNE_BATCH_SIZE);
  for (const doc of stale) {
    await ctx.db.delete(doc._id);
  }
}

/** Trim a required string; throw if empty or whitespace-only. */
export function requireText(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} is required`);
  return trimmed;
}

/** Throw unless value is a finite number >= 0. */
export function assertPrice(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative number`);
  }
}

/** Validate + normalize a sizes array: non-empty labels, price strictly > 0. */
export function validateSizes(
  sizes: Array<{ label: string; price: number }>
): Array<{ label: string; price: number }> {
  return sizes.map((size) => {
    const label = size.label.trim();
    if (!label) throw new Error("Every size needs a label");
    if (!Number.isFinite(size.price) || size.price <= 0) {
      throw new Error(`Size "${label}" needs a price greater than 0`);
    }
    return { label, price: size.price };
  });
}

/** Validate a testimonial rating: must be within 1..5; stored as an integer. */
export function normalizeRating(rating: number): number {
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  return Math.round(rating);
}

/** Clamp an admin-supplied limit to a sane integer range [1..max]. */
export function clampLimit(
  limit: number | undefined,
  fallback: number,
  max: number
): number {
  if (limit === undefined || !Number.isFinite(limit)) return fallback;
  return Math.min(Math.max(1, Math.floor(limit)), max);
}

/** Truncate long strings for activity-log details. */
export function truncateDetail(value: string, max = 80): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
