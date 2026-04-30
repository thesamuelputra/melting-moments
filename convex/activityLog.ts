import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const recent = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, { limit }) => {
    return ctx.db
      .query("activityLog")
      .withIndex("by_performedAt")
      .order("desc")
      .take(limit ?? 50);
  },
});

export const log = mutation({
  args: {
    adminSecret: v.string(),
    action: v.string(),
    section: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    await ctx.db.insert("activityLog", {
      action: args.action,
      section: args.section,
      details: args.details,
      performedAt: Date.now(),
    });

    // Auto-cleanup: prune entries older than 90 days (piggy-backed on writes)
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - NINETY_DAYS_MS;
    const old = await ctx.db
      .query("activityLog")
      .withIndex("by_performedAt", (q) => q.lt("performedAt", cutoff))
      .collect();
    for (const entry of old) {
      await ctx.db.delete(entry._id);
    }
  },
});

export const clear = mutation({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    const all = await ctx.db.query("activityLog").collect();
    await Promise.all(all.map((e) => ctx.db.delete(e._id)));
  },
});
