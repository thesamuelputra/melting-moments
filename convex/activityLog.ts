import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const recent = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, { limit }) => {
    const all = await ctx.db
      .query("activityLog")
      .withIndex("by_performedAt")
      .order("desc")
      .collect();
    return limit ? all.slice(0, limit) : all;
  },
});

export const log = mutation({
  args: {
    action: v.string(),
    section: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLog", {
      ...args,
      performedAt: Date.now(),
    });
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("activityLog").collect();
    await Promise.all(all.map((e) => ctx.db.delete(e._id)));
  },
});
