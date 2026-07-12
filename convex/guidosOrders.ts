import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin, logActivity, ORDER_STATUSES } from "./lib";

const orderStatusValidator = v.union(
  v.literal("received"),
  v.literal("preparing"),
  v.literal("ready"),
  v.literal("delivered"),
  v.literal("picked_up")
);

// List all orders, newest first (uses by_submittedAt index)
export const list = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    return await ctx.db
      .query("guidosOrders")
      .withIndex("by_submittedAt")
      .order("desc")
      .collect();
  },
});

// Status counts in one query: { total, received, preparing, ready,
// delivered, picked_up, active } (active = not delivered/picked_up)
export const counts = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const orders = await ctx.db.query("guidosOrders").collect();
    const result: Record<(typeof ORDER_STATUSES)[number], number> = {
      received: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
      picked_up: 0,
    };
    for (const order of orders) {
      if (order.status in result) {
        result[order.status as (typeof ORDER_STATUSES)[number]] += 1;
      }
    }
    return {
      total: orders.length,
      ...result,
      active: orders.length - result.delivered - result.picked_up,
    };
  },
});

// Create an order (from the public order form)
export const create = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    items: v.string(),
    deliveryMethod: v.union(v.literal("delivery"), v.literal("pickup")),
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
      args.customerName.length > 200 ||
      args.customerEmail.length > 200 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.customerEmail) ||
      args.customerPhone.length > 50 ||
      args.items.length > 3000 ||
      (args.deliveryAddress ?? "").length > 3000 ||
      (args.notes ?? "").length > 3000
    ) {
      throw new Error("Invalid submission");
    }
    // Delivery orders must carry an address.
    if (args.deliveryMethod === "delivery" && !(args.deliveryAddress ?? "").trim()) {
      throw new Error("Delivery address is required for delivery orders");
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

// Update order status (validated against ORDER_STATUSES)
export const updateStatus = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("guidosOrders"),
    status: orderStatusValidator,
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Order not found");
    await ctx.db.patch(args.id, { status: args.status });
    await logActivity(ctx, {
      action: `Updated Guido's order status to ${args.status}`,
      section: "Guido's Orders",
      details: `Order from ${existing.customerName}`,
    });
  },
});

// Delete an order
export const remove = mutation({
  args: { adminSecret: v.string(), id: v.id("guidosOrders") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Order not found");
    await ctx.db.delete(args.id);
    await logActivity(ctx, {
      action: "Deleted Guido's order",
      section: "Guido's Orders",
      details: `Order from ${existing.customerName}`,
    });
  },
});
