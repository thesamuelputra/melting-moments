import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  assertAdmin,
  clampLimit,
  INQUIRY_STATUSES,
  logActivity,
} from "./lib";

const inquiryStatusValidator = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("booked"),
  v.literal("declined"),
  v.literal("archived")
);

// List all inquiries, newest first (uses by_submittedAt index)
export const list = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    return await ctx.db
      .query("inquiries")
      .withIndex("by_submittedAt")
      .order("desc")
      .collect();
  },
});

// The most recent N inquiries (limit clamped to 1..200, default 10)
export const recent = query({
  args: { adminSecret: v.string(), limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    return await ctx.db
      .query("inquiries")
      .withIndex("by_submittedAt")
      .order("desc")
      .take(clampLimit(args.limit, 10, 200));
  },
});

// Status counts in one query: { total, new, contacted, booked, declined,
// archived, active } (active = not archived)
export const counts = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const inquiries = await ctx.db.query("inquiries").collect();
    const result: Record<(typeof INQUIRY_STATUSES)[number], number> = {
      new: 0,
      contacted: 0,
      booked: 0,
      declined: 0,
      archived: 0,
    };
    for (const inquiry of inquiries) {
      if (inquiry.status in result) {
        result[inquiry.status as (typeof INQUIRY_STATUSES)[number]] += 1;
      }
    }
    return {
      total: inquiries.length,
      ...result,
      active: inquiries.length - result.archived,
    };
  },
});

// Create a new inquiry (from the public contact form).
// Customer-submitted fields are immutable after create — admin edits go to
// adminNotes via updateAdminNotes.
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

// Update inquiry status (validated against INQUIRY_STATUSES).
// Moving TO 'archived' remembers the previous status in archivedFromStatus
// so `restore` can put the inquiry back where it was.
export const updateStatus = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("inquiries"),
    status: inquiryStatusValidator,
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Inquiry not found");

    if (args.status === "archived" && existing.status !== "archived") {
      await ctx.db.patch(args.id, {
        status: "archived",
        archivedFromStatus: existing.status,
      });
    } else {
      // Leaving (or staying outside) the archived state clears the marker.
      await ctx.db.patch(args.id, {
        status: args.status,
        archivedFromStatus: undefined,
      });
    }
    await logActivity(ctx, {
      action: `Updated inquiry status to ${args.status}`,
      section: "Inquiries",
      details: `Inquiry from ${existing.name}`,
    });
  },
});

// Restore an archived inquiry to the status it had before archiving
// (falls back to 'new' if unknown).
export const restore = mutation({
  args: { adminSecret: v.string(), id: v.id("inquiries") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Inquiry not found");

    const previous = existing.archivedFromStatus;
    const target =
      previous &&
      previous !== "archived" &&
      (INQUIRY_STATUSES as readonly string[]).includes(previous)
        ? previous
        : "new";
    await ctx.db.patch(args.id, {
      status: target,
      archivedFromStatus: undefined,
    });
    await logActivity(ctx, {
      action: `Restored inquiry to ${target}`,
      section: "Inquiries",
      details: `Inquiry from ${existing.name}`,
    });
    return target;
  },
});

// Update the admin-only notes on an inquiry. Customer-submitted fields
// (including the customer's own `notes`) stay immutable.
export const updateAdminNotes = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("inquiries"),
    adminNotes: v.string(),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Inquiry not found");
    if (args.adminNotes.length > 5000) throw new Error("Notes are too long");
    await ctx.db.patch(args.id, { adminNotes: args.adminNotes });
    await logActivity(ctx, {
      action: "Updated inquiry notes",
      section: "Inquiries",
      details: `Inquiry from ${existing.name}`,
    });
  },
});

// Delete an inquiry
export const remove = mutation({
  args: { adminSecret: v.string(), id: v.id("inquiries") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Inquiry not found");
    await ctx.db.delete(args.id);
    await logActivity(ctx, {
      action: "Deleted inquiry",
      section: "Inquiries",
      details: `Inquiry from ${existing.name}`,
    });
  },
});
