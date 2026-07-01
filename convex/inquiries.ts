import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all inquiries (sorted by newest first)
export const list = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    const inquiries = await ctx.db.query("inquiries").collect();
    return inquiries.sort((a, b) => b.submittedAt - a.submittedAt);
  },
});

// Count inquiries by status
export const countByStatus = query({
  args: { adminSecret: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    const items = await ctx.db
      .query("inquiries")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    return items.length;
  },
});

// Count all non-archived
export const countActive = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    const items = await ctx.db.query("inquiries").collect();
    return items.filter((i) => i.status !== "archived").length;
  },
});

// Create a new inquiry (from contact form)
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    eventType: v.string(),
    guestCount: v.optional(v.string()),
    date: v.optional(v.string()),
    venue: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This is a public mutation callable directly (bypassing the API route),
    // so validate inputs server-side before inserting.
    if (
      !args.name.trim() ||
      !args.email.trim() ||
      !args.eventType.trim() ||
      args.name.length > 200 ||
      args.email.length > 200 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email) ||
      (args.phone ?? "").length > 50 ||
      args.eventType.length > 300 ||
      (args.venue ?? "").length > 300 ||
      (args.guestCount ?? "").length > 300 ||
      (args.date ?? "").length > 300 ||
      (args.notes ?? "").length > 3000
    ) {
      throw new Error("Invalid submission");
    }
    return await ctx.db.insert("inquiries", {
      name: args.name,
      email: args.email,
      phone: args.phone ?? "",
      eventType: args.eventType,
      guestCount: args.guestCount ?? "",
      date: args.date ?? "",
      venue: args.venue ?? "",
      status: "new",
      notes: args.notes ?? "",
      submittedAt: Date.now(),
    });
  },
});

// Update inquiry status
export const updateStatus = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("inquiries"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Delete an inquiry
export const remove = mutation({
  args: { adminSecret: v.string(), id: v.id("inquiries") },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});
