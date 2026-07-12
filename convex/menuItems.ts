import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin, assertPrice, logActivity, requireText } from "./lib";

type MenuItemSortable = { category: string; orderIndex: number };

function byCategoryThenOrder(a: MenuItemSortable, b: MenuItemSortable): number {
  if (a.category < b.category) return -1;
  if (a.category > b.category) return 1;
  return a.orderIndex - b.orderIndex;
}

// Get all menu items (admin view — includes inactive)
export const list = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const items = await ctx.db.query("menuItems").collect();
    return items.sort(byCategoryThenOrder);
  },
});

// Get only active menu items (public view)
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    return items.filter((item) => item.isActive).sort(byCategoryThenOrder);
  },
});

// Count items (non-PII — used by the admin dashboard)
export const count = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    return items.length;
  },
});

// Count unique categories (non-PII — used by the admin dashboard)
export const categoryCount = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    const categories = new Set(items.map((i) => i.category));
    return categories.size;
  },
});

// Add a menu item. When orderIndex is omitted it is appended to the end of
// its category (max(orderIndex) + 1).
export const add = mutation({
  args: {
    adminSecret: v.string(),
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
    assertAdmin(args.adminSecret);
    const category = requireText(args.category, "Category");
    const name = requireText(args.name, "Name");
    if (args.price !== undefined) assertPrice(args.price, "Price");
    if (args.orderIndex !== undefined && !Number.isFinite(args.orderIndex)) {
      throw new Error("orderIndex must be a finite number");
    }

    let orderIndex = args.orderIndex;
    if (orderIndex === undefined) {
      const siblings = await ctx.db
        .query("menuItems")
        .withIndex("by_category", (q) => q.eq("category", category))
        .collect();
      orderIndex = siblings.reduce((max, s) => Math.max(max, s.orderIndex), -1) + 1;
    }

    const id = await ctx.db.insert("menuItems", {
      category,
      name,
      description: args.description ?? "",
      price: args.price,
      priceLabel: args.priceLabel ?? "Included",
      orderIndex,
      isActive: args.isActive ?? true,
      isFeatured: args.isFeatured ?? false,
    });
    await logActivity(ctx, {
      action: "Added menu item",
      section: "Menu",
      details: `${name} (${category})`,
    });
    return id;
  },
});

// Update a menu item — partial patch: only provided fields are written,
// omitted fields are left untouched. Pass price: null to clear the price.
export const update = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("menuItems"),
    category: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.union(v.float64(), v.null())),
    priceLabel: v.optional(v.string()),
    orderIndex: v.optional(v.float64()),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Menu item not found");

    const patch: {
      category?: string;
      name?: string;
      description?: string;
      price?: number | undefined;
      priceLabel?: string;
      orderIndex?: number;
      isActive?: boolean;
      isFeatured?: boolean;
    } = {};
    if (args.category !== undefined) patch.category = requireText(args.category, "Category");
    if (args.name !== undefined) patch.name = requireText(args.name, "Name");
    if (args.description !== undefined) patch.description = args.description;
    if (args.price !== undefined) {
      if (args.price === null) {
        patch.price = undefined; // undefined in patch removes the field
      } else {
        assertPrice(args.price, "Price");
        patch.price = args.price;
      }
    }
    if (args.priceLabel !== undefined) patch.priceLabel = requireText(args.priceLabel, "Price label");
    if (args.orderIndex !== undefined) {
      if (!Number.isFinite(args.orderIndex)) throw new Error("orderIndex must be a finite number");
      patch.orderIndex = args.orderIndex;
    }
    if (args.isActive !== undefined) patch.isActive = args.isActive;
    if (args.isFeatured !== undefined) patch.isFeatured = args.isFeatured;

    await ctx.db.patch(args.id, patch);
    await logActivity(ctx, {
      action: "Updated menu item",
      section: "Menu",
      details: `${patch.name ?? existing.name} (${patch.category ?? existing.category})`,
    });
  },
});

// Delete a menu item
export const remove = mutation({
  args: { id: v.id("menuItems"), adminSecret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Menu item not found");
    await ctx.db.delete(args.id);
    await logActivity(ctx, {
      action: "Deleted menu item",
      section: "Menu",
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
    ids: v.array(v.id("menuItems")),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    for (let i = 0; i < args.ids.length; i++) {
      const doc = await ctx.db.get(args.ids[i]);
      if (!doc) throw new Error("Menu item not found — reorder aborted");
      if (doc.category !== args.category) {
        throw new Error(
          `"${doc.name}" is not in category "${args.category}" — reorder aborted`
        );
      }
      await ctx.db.patch(args.ids[i], { orderIndex: i });
    }
    await logActivity(ctx, {
      action: "Reordered menu items",
      section: "Menu",
      details: args.category,
    });
  },
});
