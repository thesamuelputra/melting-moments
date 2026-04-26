import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all settings as key-value pairs
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("businessSettings").collect();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  },
});

// Save settings (upsert by key)
export const save = mutation({
  args: {
    entries: v.array(v.object({ key: v.string(), value: v.string() })),
  },
  handler: async (ctx, args) => {
    for (const { key, value } of args.entries) {
      const existing = await ctx.db
        .query("businessSettings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { value });
      } else {
        await ctx.db.insert("businessSettings", { key, value });
      }
    }
  },
});
