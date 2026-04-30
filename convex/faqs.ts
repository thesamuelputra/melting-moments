import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("faqs").order("asc").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("faqs").order("asc").collect();
    return all.filter((f) => f.isActive);
  },
});

export const create = mutation({
  args: {
    adminSecret: v.string(),
    question: v.string(),
    answer: v.string(),
    orderIndex: v.float64(),
  },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    const { adminSecret, ...data } = args;
    return await ctx.db.insert("faqs", {
      ...data,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("faqs"),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    orderIndex: v.optional(v.float64()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { adminSecret, id, ...fields }) => {
    if (adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { adminSecret: v.string(), id: v.id("faqs") },
  handler: async (ctx, { adminSecret, id }) => {
    if (adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    await ctx.db.delete(id);
  },
});
