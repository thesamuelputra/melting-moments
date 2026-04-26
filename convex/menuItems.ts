import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all menu items (admin view — includes inactive)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    return items.sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return a.orderIndex - b.orderIndex;
    });
  },
});

// Get only active menu items (public view)
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    return items
      .filter((item) => item.isActive)
      .sort((a, b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        return a.orderIndex - b.orderIndex;
      });
  },
});

// Count items
export const count = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    return items.length;
  },
});

// Count unique categories
export const categoryCount = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    const categories = new Set(items.map((i) => i.category));
    return categories.size;
  },
});

// Add a menu item
export const add = mutation({
  args: {
    category: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.float64()),
    priceLabel: v.optional(v.string()),
    orderIndex: v.optional(v.float64()),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      category: args.category,
      name: args.name,
      description: args.description ?? "",
      price: args.price,
      priceLabel: args.priceLabel ?? "Included",
      orderIndex: args.orderIndex ?? 0,
      isActive: args.isActive ?? true,
      isFeatured: args.isFeatured ?? false,
    });
  },
});

// Update a menu item
export const update = mutation({
  args: {
    id: v.id("menuItems"),
    category: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.float64()),
    priceLabel: v.optional(v.string()),
    orderIndex: v.optional(v.float64()),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, {
      category: data.category,
      name: data.name,
      description: data.description ?? "",
      price: data.price,
      priceLabel: data.priceLabel ?? "Included",
      orderIndex: data.orderIndex ?? 0,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
    });
  },
});

// Delete a menu item
export const remove = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
