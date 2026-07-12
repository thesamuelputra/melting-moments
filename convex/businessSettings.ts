import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin, logActivity, truncateDetail } from "./lib";

// Get all settings as key-value pairs.
// Intentionally public-read: consumed by every public page via src/lib/cms.ts.
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

// Atomic multi-key save (upsert by key) — this is the "setMany".
// Optional `activity` overrides the default activity-log entry so callers
// (Site Content vs Settings) can label the change appropriately.
export const save = mutation({
  args: {
    adminSecret: v.string(),
    entries: v.array(v.object({ key: v.string(), value: v.string() })),
    activity: v.optional(
      v.object({
        action: v.string(),
        section: v.string(),
        details: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    for (const { key, value } of args.entries) {
      if (!key.trim()) throw new Error("Setting key is required");
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
    await logActivity(
      ctx,
      args.activity ?? {
        action: "Updated business settings",
        section: "Settings",
        details: truncateDetail(args.entries.map((e) => e.key).join(", ")),
      }
    );
  },
});
