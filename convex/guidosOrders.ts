import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all orders (sorted newest first)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("guidosOrders").collect();
    return orders.sort((a, b) => b.submittedAt - a.submittedAt);
  },
});

// Count orders by status
export const countByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("guidosOrders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    return items.length;
  },
});

// Count all non-archived orders
export const countActive = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("guidosOrders").collect();
    return items.length;
  },
});

// Create an order (from order form)
export const create = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    items: v.string(),
    deliveryMethod: v.string(),
    deliveryAddress: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("guidosOrders", {
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      items: args.items,
      deliveryMethod: args.deliveryMethod,
      deliveryAddress: args.deliveryAddress ?? "",
      notes: args.notes ?? "",
      status: "received",
      submittedAt: Date.now(),
    });
  },
});

// Update order status
export const updateStatus = mutation({
  args: {
    id: v.id("guidosOrders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Delete an order
export const remove = mutation({
  args: { id: v.id("guidosOrders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
