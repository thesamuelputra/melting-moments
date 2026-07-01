import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all orders (sorted newest first)
export const list = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    const orders = await ctx.db.query("guidosOrders").collect();
    return orders.sort((a, b) => b.submittedAt - a.submittedAt);
  },
});

// Count orders by status
export const countByStatus = query({
  args: { adminSecret: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    const items = await ctx.db
      .query("guidosOrders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    return items.length;
  },
});

// Count all active orders (excludes delivered/picked_up)
export const countActive = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    const items = await ctx.db.query("guidosOrders").collect();
    return items.filter((i) => !["delivered", "picked_up"].includes(i.status)).length;
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
    // This is a public mutation callable directly (bypassing the API route),
    // so validate inputs server-side before inserting.
    if (
      !args.customerName.trim() ||
      !args.customerEmail.trim() ||
      !args.customerPhone.trim() ||
      !args.items.trim() ||
      !args.deliveryMethod.trim() ||
      args.customerName.length > 200 ||
      args.customerEmail.length > 200 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.customerEmail) ||
      args.customerPhone.length > 50 ||
      args.deliveryMethod.length > 300 ||
      args.items.length > 3000 ||
      (args.deliveryAddress ?? "").length > 3000 ||
      (args.notes ?? "").length > 3000
    ) {
      throw new Error("Invalid submission");
    }
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
    adminSecret: v.string(),
    id: v.id("guidosOrders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Delete an order
export const remove = mutation({
  args: { adminSecret: v.string(), id: v.id("guidosOrders") },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});
