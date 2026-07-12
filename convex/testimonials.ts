import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  assertAdmin,
  logActivity,
  normalizeRating,
  requireText,
} from "./lib";

// All testimonials (admin view — includes inactive), sorted by orderIndex
export const list = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const all = await ctx.db.query("testimonials").collect();
    return all.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

// Active testimonials (public view), sorted by orderIndex
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("testimonials").collect();
    return all
      .filter((t) => t.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

// Create a testimonial. When orderIndex is omitted it is appended to the end
// (max(orderIndex) + 1 across the table). brand undefined = shows on both.
export const create = mutation({
  args: {
    adminSecret: v.string(),
    author: v.string(),
    role: v.optional(v.string()),
    text: v.string(),
    rating: v.optional(v.float64()),
    brand: v.optional(v.union(v.literal("catering"), v.literal("guidos"))),
    orderIndex: v.optional(v.float64()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const author = requireText(args.author, "Author");
    const text = requireText(args.text, "Text");
    const rating = args.rating !== undefined ? normalizeRating(args.rating) : undefined;
    if (args.orderIndex !== undefined && !Number.isFinite(args.orderIndex)) {
      throw new Error("orderIndex must be a finite number");
    }

    let orderIndex = args.orderIndex;
    if (orderIndex === undefined) {
      const all = await ctx.db.query("testimonials").collect();
      orderIndex = all.reduce((max, t) => Math.max(max, t.orderIndex), -1) + 1;
    }

    const id = await ctx.db.insert("testimonials", {
      author,
      text,
      orderIndex,
      isActive: args.isActive ?? true,
      ...(args.role !== undefined ? { role: args.role } : {}),
      ...(rating !== undefined ? { rating } : {}),
      ...(args.brand !== undefined ? { brand: args.brand } : {}),
    });
    await logActivity(ctx, {
      action: "Added testimonial",
      section: "Testimonials",
      details: `From ${author}`,
    });
    return id;
  },
});

// Update a testimonial — partial patch: only provided fields are written,
// omitted fields are left untouched. Pass null to clear an optional field:
// role: null, rating: null, brand: null (brand null = shows on both).
export const update = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("testimonials"),
    author: v.optional(v.string()),
    role: v.optional(v.union(v.string(), v.null())),
    text: v.optional(v.string()),
    rating: v.optional(v.union(v.float64(), v.null())),
    brand: v.optional(
      v.union(v.literal("catering"), v.literal("guidos"), v.null())
    ),
    orderIndex: v.optional(v.float64()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Testimonial not found");

    const patch: {
      author?: string;
      role?: string | undefined;
      text?: string;
      rating?: number | undefined;
      brand?: "catering" | "guidos" | undefined;
      orderIndex?: number;
      isActive?: boolean;
    } = {};
    if (args.author !== undefined) patch.author = requireText(args.author, "Author");
    if (args.role !== undefined) {
      patch.role = args.role === null ? undefined : args.role;
    }
    if (args.text !== undefined) patch.text = requireText(args.text, "Text");
    if (args.rating !== undefined) {
      patch.rating = args.rating === null ? undefined : normalizeRating(args.rating);
    }
    if (args.brand !== undefined) {
      patch.brand = args.brand === null ? undefined : args.brand;
    }
    if (args.orderIndex !== undefined) {
      if (!Number.isFinite(args.orderIndex)) throw new Error("orderIndex must be a finite number");
      patch.orderIndex = args.orderIndex;
    }
    if (args.isActive !== undefined) patch.isActive = args.isActive;

    await ctx.db.patch(args.id, patch);
    await logActivity(ctx, {
      action: "Updated testimonial",
      section: "Testimonials",
      details: `From ${patch.author ?? existing.author}`,
    });
  },
});

// Delete a testimonial
export const remove = mutation({
  args: { adminSecret: v.string(), id: v.id("testimonials") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Testimonial not found");
    await ctx.db.delete(args.id);
    await logActivity(ctx, {
      action: "Deleted testimonial",
      section: "Testimonials",
      details: `From ${existing.author}`,
    });
  },
});

// Atomically reorder all testimonials: patches orderIndex = array position
// for every id, in ONE transaction. Throws (rolling back) on any unknown id.
export const reorder = mutation({
  args: { adminSecret: v.string(), ids: v.array(v.id("testimonials")) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    for (let i = 0; i < args.ids.length; i++) {
      const doc = await ctx.db.get(args.ids[i]);
      if (!doc) throw new Error("Testimonial not found — reorder aborted");
      await ctx.db.patch(args.ids[i], { orderIndex: i });
    }
    await logActivity(ctx, {
      action: "Reordered testimonials",
      section: "Testimonials",
    });
  },
});
