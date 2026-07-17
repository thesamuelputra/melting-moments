import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin, logActivity, requireText, truncateDetail } from "./lib";

// All FAQs (admin view, includes inactive), sorted by orderIndex
export const list = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const all = await ctx.db.query("faqs").collect();
    return all.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

// Active FAQs (public view), sorted by orderIndex; includes `category`
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("faqs").collect();
    return all
      .filter((f) => f.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

// Create an FAQ. When orderIndex is omitted it is appended to the end
// (max(orderIndex) + 1 across the table).
// Seed the starter questions in one transaction. A no-op unless the table is
// empty, so concurrent imports (or an import racing a first create) can never
// produce duplicates: the emptiness check and the inserts commit atomically.
export const seedStarters = mutation({
  args: {
    adminSecret: v.string(),
    items: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
        category: v.optional(v.union(v.literal("catering"), v.literal("guidos"))),
      })
    ),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.query("faqs").collect();
    if (existing.length > 0) return 0;
    let orderIndex = 0;
    for (const item of args.items) {
      await ctx.db.insert("faqs", {
        question: requireText(item.question, "Question"),
        answer: requireText(item.answer, "Answer"),
        ...(item.category !== undefined ? { category: item.category } : {}),
        orderIndex: orderIndex++,
        isActive: true,
      });
    }
    await logActivity(ctx, {
      action: "Imported starter FAQs",
      section: "FAQ",
      details: `${args.items.length} questions`,
    });
    return args.items.length;
  },
});

export const create = mutation({
  args: {
    adminSecret: v.string(),
    question: v.string(),
    answer: v.string(),
    category: v.optional(v.union(v.literal("catering"), v.literal("guidos"))),
    orderIndex: v.optional(v.float64()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const question = requireText(args.question, "Question");
    const answer = requireText(args.answer, "Answer");
    if (args.orderIndex !== undefined && !Number.isFinite(args.orderIndex)) {
      throw new Error("orderIndex must be a finite number");
    }

    let orderIndex = args.orderIndex;
    if (orderIndex === undefined) {
      const all = await ctx.db.query("faqs").collect();
      orderIndex = all.reduce((max, f) => Math.max(max, f.orderIndex), -1) + 1;
    }

    const id = await ctx.db.insert("faqs", {
      question,
      answer,
      ...(args.category !== undefined ? { category: args.category } : {}),
      orderIndex,
      isActive: args.isActive ?? true,
    });
    await logActivity(ctx, {
      action: "Added FAQ",
      section: "FAQ",
      details: truncateDetail(question),
    });
    return id;
  },
});

// Update an FAQ. Partial patch: only provided fields are written, omitted
// fields are left untouched. Pass category: null to clear it (general FAQ).
export const update = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("faqs"),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    category: v.optional(
      v.union(v.literal("catering"), v.literal("guidos"), v.null())
    ),
    orderIndex: v.optional(v.float64()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("FAQ not found");

    const patch: {
      question?: string;
      answer?: string;
      category?: "catering" | "guidos" | undefined;
      orderIndex?: number;
      isActive?: boolean;
    } = {};
    if (args.question !== undefined) patch.question = requireText(args.question, "Question");
    if (args.answer !== undefined) patch.answer = requireText(args.answer, "Answer");
    if (args.category !== undefined) {
      patch.category = args.category === null ? undefined : args.category;
    }
    if (args.orderIndex !== undefined) {
      if (!Number.isFinite(args.orderIndex)) throw new Error("orderIndex must be a finite number");
      patch.orderIndex = args.orderIndex;
    }
    if (args.isActive !== undefined) patch.isActive = args.isActive;

    await ctx.db.patch(args.id, patch);
    await logActivity(ctx, {
      action: "Updated FAQ",
      section: "FAQ",
      details: truncateDetail(patch.question ?? existing.question),
    });
  },
});

// Delete an FAQ
export const remove = mutation({
  args: { adminSecret: v.string(), id: v.id("faqs") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("FAQ not found");
    await ctx.db.delete(args.id);
    await logActivity(ctx, {
      action: "Deleted FAQ",
      section: "FAQ",
      details: truncateDetail(existing.question),
    });
  },
});

// Atomically reorder all FAQs: patches orderIndex = array position for every
// id, in a single transaction. Throws (rolling everything back) on any
// unknown id.
export const reorder = mutation({
  args: { adminSecret: v.string(), ids: v.array(v.id("faqs")) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    for (let i = 0; i < args.ids.length; i++) {
      const doc = await ctx.db.get(args.ids[i]);
      if (!doc) throw new Error("FAQ not found; reorder aborted");
      await ctx.db.patch(args.ids[i], { orderIndex: i });
    }
    await logActivity(ctx, { action: "Reordered FAQs", section: "FAQ" });
  },
});
