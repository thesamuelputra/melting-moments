import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all products (admin — includes unavailable)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("guidosProducts").collect();
    return items.sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return a.orderIndex - b.orderIndex;
    });
  },
});

// Get only available products (public)
export const listAvailable = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("guidosProducts").collect();
    return items
      .filter((item) => item.isAvailable)
      .sort((a, b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        return a.orderIndex - b.orderIndex;
      });
  },
});

// Count products
export const count = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("guidosProducts").collect();
    return items.length;
  },
});

// Add a product
export const add = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    priceFrom: v.float64(),
    sizes: v.optional(v.array(v.object({
      label: v.string(),
      price: v.float64(),
    }))),
    image: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
    isLimitedEdition: v.optional(v.boolean()),
    orderIndex: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("guidosProducts", {
      name: args.name,
      category: args.category,
      priceFrom: args.priceFrom,
      sizes: args.sizes,
      image: args.image,
      isAvailable: args.isAvailable ?? true,
      isLimitedEdition: args.isLimitedEdition ?? false,
      orderIndex: args.orderIndex ?? 0,
    });
  },
});

// Update a product
export const update = mutation({
  args: {
    id: v.id("guidosProducts"),
    name: v.string(),
    category: v.string(),
    priceFrom: v.float64(),
    sizes: v.optional(v.array(v.object({
      label: v.string(),
      price: v.float64(),
    }))),
    image: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
    isLimitedEdition: v.optional(v.boolean()),
    orderIndex: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, {
      name: data.name,
      category: data.category,
      priceFrom: data.priceFrom,
      sizes: data.sizes,
      image: data.image,
      isAvailable: data.isAvailable ?? true,
      isLimitedEdition: data.isLimitedEdition ?? false,
      orderIndex: data.orderIndex ?? 0,
    });
  },
});

// Delete a product
export const remove = mutation({
  args: { id: v.id("guidosProducts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
