import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin, clampLimit, logActivity } from "./lib";

// Most recent activity entries (limit clamped to 1..200, default 50)
export const recent = query({
  args: { adminSecret: v.string(), limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    return await ctx.db
      .query("activityLog")
      .withIndex("by_performedAt")
      .order("desc")
      .take(clampLimit(args.limit, 50, 200));
  },
});

// Deprecated: activity is now logged inside each entity mutation via
// logActivity (convex/lib.ts) so it is atomic with the change. Kept exported
// for the server actions that still call it; do not add new callers.
export const log = mutation({
  args: {
    adminSecret: v.string(),
    action: v.string(),
    section: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    await logActivity(ctx, {
      action: args.action,
      section: args.section,
      details: args.details,
    });
  },
});

// Clear the entire activity log
export const clear = mutation({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const all = await ctx.db.query("activityLog").collect();
    await Promise.all(all.map((e) => ctx.db.delete(e._id)));
    await logActivity(ctx, {
      action: "Cleared activity log",
      section: "Activity",
    });
  },
});
