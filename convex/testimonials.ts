import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("testimonials").order("asc").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("testimonials").order("asc").collect();
    return all.filter((t) => t.isActive);
  },
});

export const create = mutation({
  args: {
    author: v.string(),
    role: v.optional(v.string()),
    text: v.string(),
    rating: v.optional(v.float64()),
    brand: v.optional(v.string()),
    orderIndex: v.float64(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("testimonials", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("testimonials"),
    author: v.optional(v.string()),
    role: v.optional(v.string()),
    text: v.optional(v.string()),
    rating: v.optional(v.float64()),
    brand: v.optional(v.string()),
    orderIndex: v.optional(v.float64()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("testimonials") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
