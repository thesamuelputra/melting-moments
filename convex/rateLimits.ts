import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib";

// Rows whose window opened more than this long ago are safe to drop.
const STALE_AFTER_MS = 10 * 60 * 1000;
// Bound on opportunistic cleanup so a hit never triggers unbounded work.
const CLEANUP_BATCH = 5;

/**
 * Authoritative fixed-window rate limiter for the public API routes.
 * The in-memory limiter in src/proxy.ts is per-isolate on Vercel, so this
 * mutation is the check that actually holds globally.
 *
 * Gated by assertAdmin: the API routes run server-side with ADMIN_PASSWORD,
 * so outsiders cannot call this mutation (or reset counters) directly.
 */
export const hit = mutation({
  args: {
    adminSecret: v.string(),
    key: v.string(),
    limit: v.float64(),
    windowMs: v.float64(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ allowed: boolean; retryAfterSeconds?: number }> => {
    assertAdmin(args.adminSecret);
    const now = Date.now();
    const row = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    // No row yet, or the previous window has expired: start a fresh window.
    if (!row || now - row.windowStart > args.windowMs) {
      if (row) {
        await ctx.db.patch(row._id, { windowStart: now, count: 1 });
      } else {
        await ctx.db.insert("rateLimits", {
          key: args.key,
          windowStart: now,
          count: 1,
        });
      }

      // Opportunistic cleanup on reset: delete a bounded batch of rows whose
      // window is long over so the table cannot grow without bound. The row
      // just written has windowStart = now, so it is never in this batch.
      const cutoff = now - STALE_AFTER_MS;
      const stale = await ctx.db
        .query("rateLimits")
        .filter((q) => q.lt(q.field("windowStart"), cutoff))
        .take(CLEANUP_BATCH);
      for (const doc of stale) {
        await ctx.db.delete(doc._id);
      }

      return { allowed: true };
    }

    // Same window: count this request and check the limit.
    const count = row.count + 1;
    await ctx.db.patch(row._id, { count });
    if (count <= args.limit) {
      return { allowed: true };
    }
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((row.windowStart + args.windowMs - now) / 1000),
    };
  },
});
