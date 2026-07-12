import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  assertAdmin,
  assertPrice,
  logActivity,
  requireText,
  validateSizes,
} from "./lib";

type ProductSortable = { category: string; orderIndex: number };

function byCategoryThenOrder(a: ProductSortable, b: ProductSortable): number {
  if (a.category < b.category) return -1;
  if (a.category > b.category) return 1;
  return a.orderIndex - b.orderIndex;
}

// All products, sorted by category then orderIndex. Intentionally public:
// the public Guido's menu shows sold-out items too (also the admin list).
export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("guidosProducts").collect();
    return items.sort(byCategoryThenOrder);
  },
});

// Count products (non-PII — used by the admin dashboard)
export const count = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("guidosProducts").collect();
    return items.length;
  },
});

// Add a product. When orderIndex is omitted it is appended to the end of
// its category (max(orderIndex) + 1).
export const add = mutation({
  args: {
    adminSecret: v.string(),
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
    assertAdmin(args.adminSecret);
    const name = requireText(args.name, "Name");
    const category = requireText(args.category, "Category");
    assertPrice(args.priceFrom, "Price");
    const sizes = args.sizes !== undefined ? validateSizes(args.sizes) : undefined;
    const image = args.image?.trim() || undefined;
    if (args.orderIndex !== undefined && !Number.isFinite(args.orderIndex)) {
      throw new Error("orderIndex must be a finite number");
    }

    let orderIndex = args.orderIndex;
    if (orderIndex === undefined) {
      const siblings = await ctx.db
        .query("guidosProducts")
        .withIndex("by_category", (q) => q.eq("category", category))
        .collect();
      orderIndex = siblings.reduce((max, s) => Math.max(max, s.orderIndex), -1) + 1;
    }

    const id = await ctx.db.insert("guidosProducts", {
      name,
      category,
      priceFrom: args.priceFrom,
      sizes,
      image,
      isAvailable: args.isAvailable ?? true,
      isLimitedEdition: args.isLimitedEdition ?? false,
      orderIndex,
    });
    await logActivity(ctx, {
      action: "Added Guido's product",
      section: "Guido's Products",
      details: `${name} (${category})`,
    });
    return id;
  },
});

// Update a product — partial patch: only provided fields are written; omitted
// fields (including isAvailable, orderIndex, sizes, image) are left untouched.
// Pass sizes: null or image: null to clear those fields.
export const update = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("guidosProducts"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    priceFrom: v.optional(v.float64()),
    sizes: v.optional(v.union(
      v.array(v.object({ label: v.string(), price: v.float64() })),
      v.null()
    )),
    image: v.optional(v.union(v.string(), v.null())),
    isAvailable: v.optional(v.boolean()),
    isLimitedEdition: v.optional(v.boolean()),
    orderIndex: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Product not found");

    const patch: {
      name?: string;
      category?: string;
      priceFrom?: number;
      sizes?: Array<{ label: string; price: number }> | undefined;
      image?: string | undefined;
      isAvailable?: boolean;
      isLimitedEdition?: boolean;
      orderIndex?: number;
    } = {};
    if (args.name !== undefined) patch.name = requireText(args.name, "Name");
    if (args.category !== undefined) patch.category = requireText(args.category, "Category");
    if (args.priceFrom !== undefined) {
      assertPrice(args.priceFrom, "Price");
      patch.priceFrom = args.priceFrom;
    }
    if (args.sizes !== undefined) {
      patch.sizes = args.sizes === null ? undefined : validateSizes(args.sizes);
    }
    if (args.image !== undefined) {
      patch.image = args.image === null ? undefined : args.image.trim() || undefined;
    }
    if (args.isAvailable !== undefined) patch.isAvailable = args.isAvailable;
    if (args.isLimitedEdition !== undefined) patch.isLimitedEdition = args.isLimitedEdition;
    if (args.orderIndex !== undefined) {
      if (!Number.isFinite(args.orderIndex)) throw new Error("orderIndex must be a finite number");
      patch.orderIndex = args.orderIndex;
    }

    await ctx.db.patch(args.id, patch);
    await logActivity(ctx, {
      action: "Updated Guido's product",
      section: "Guido's Products",
      details: `${patch.name ?? existing.name} (${patch.category ?? existing.category})`,
    });
  },
});

// Delete a product
export const remove = mutation({
  args: { id: v.id("guidosProducts"), adminSecret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Product not found");
    await ctx.db.delete(args.id);
    await logActivity(ctx, {
      action: "Deleted Guido's product",
      section: "Guido's Products",
      details: `${existing.name} (${existing.category})`,
    });
  },
});

// Atomically reorder a category: patches orderIndex = array position for
// every id, in ONE transaction. Throws (rolling everything back) if any id
// is missing or belongs to a different category.
export const reorder = mutation({
  args: {
    adminSecret: v.string(),
    category: v.string(),
    ids: v.array(v.id("guidosProducts")),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    for (let i = 0; i < args.ids.length; i++) {
      const doc = await ctx.db.get(args.ids[i]);
      if (!doc) throw new Error("Product not found — reorder aborted");
      if (doc.category !== args.category) {
        throw new Error(
          `"${doc.name}" is not in category "${args.category}" — reorder aborted`
        );
      }
      await ctx.db.patch(args.ids[i], { orderIndex: i });
    }
    await logActivity(ctx, {
      action: "Reordered Guido's products",
      section: "Guido's Products",
      details: args.category,
    });
  },
});
