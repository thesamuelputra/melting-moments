import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a short-lived upload URL (admin-only)
export const generateUploadUrl = mutation({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});

// Save uploaded file metadata to the database
export const saveImage = mutation({
  args: {
    adminSecret: v.string(),
    storageId: v.id("_storage"),
    title: v.string(),
    alt: v.string(),
    section: v.optional(v.string()),
    orderIndex: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    const { adminSecret, ...data } = args;
    return await ctx.db.insert("siteImages", {
      ...data,
      orderIndex: data.orderIndex ?? 0,
      uploadedAt: Date.now(),
    });
  },
});

// List all images, optionally filtered by section
export const list = query({
  args: { section: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.section) {
      const images = await ctx.db
        .query("siteImages")
        .withIndex("by_section", (q) => q.eq("section", args.section!))
        .collect();
      // Resolve storage URLs
      return Promise.all(
        images.map(async (img) => ({
          ...img,
          url: await ctx.storage.getUrl(img.storageId),
        }))
      );
    }
    const images = await ctx.db.query("siteImages").collect();
    return Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await ctx.storage.getUrl(img.storageId),
      }))
    );
  },
});

// Update image metadata
export const update = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("siteImages"),
    title: v.optional(v.string()),
    alt: v.optional(v.string()),
    section: v.optional(v.string()),
    orderIndex: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    const { adminSecret, id, ...fields } = args;
    // Filter out undefined values
    const updates: Record<string, string | number> = {};
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.alt !== undefined) updates.alt = fields.alt;
    if (fields.section !== undefined) updates.section = fields.section;
    if (fields.orderIndex !== undefined) updates.orderIndex = fields.orderIndex;
    await ctx.db.patch(id, updates);
  },
});

// Delete an image (removes both storage file and database record)
export const remove = mutation({
  args: { adminSecret: v.string(), id: v.id("siteImages") },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized");
    const image = await ctx.db.get(args.id);
    if (image) {
      await ctx.storage.delete(image.storageId);
      await ctx.db.delete(args.id);
    }
  },
});
