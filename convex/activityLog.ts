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
