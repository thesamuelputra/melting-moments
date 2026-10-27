import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin, logActivity, requireText, truncateDetail } from "./lib";

const kindValidator = v.union(v.literal("restaurant"), v.literal("grocery"));

const MAX_NAME = 120;
const MAX_ADDRESS = 200;
const MAX_WEBSITE = 300;
const MAX_NOTE = 280;

function limited(value: string, max: number, field: string): string {
  if (value.length > max) throw new Error(`${field} must be ${max} characters or fewer`);
  return value;
}

/** Optional text: trimmed, and empty becomes undefined so the field is cleared. */
function optionalText(value: string | undefined, max: number, field: string): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed ? limited(trimmed, max, field) : undefined;
}

/** The map only covers south Vancouver Island, but the server action holds
 *  that rule; here a coordinate just has to be a real one. */
function assertCoordinates(lat: number, lng: number): void {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Latitude is out of range");
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error("Longitude is out of range");
}

// Every stockist (admin view, includes hidden ones), sorted by orderIndex
export const list = query({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const all = await ctx.db.query("stockists").collect();
    return all.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

// Visible stockists (public view: the /guidos map), sorted by orderIndex
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("stockists").collect();
    return all
      .filter((s) => s.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((s) => ({
        _id: s._id,
        name: s.name,
        kind: s.kind,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        website: s.website,
        note: s.note,
      }));
  },
});

// Number of visible stockists, for the admin dashboard
export const count = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("stockists").collect();
    return all.filter((s) => s.isActive).length;
  },
});

// Add a stockist at the end of the list
export const create = mutation({
  args: {
    adminSecret: v.string(),
    name: v.string(),
    kind: kindValidator,
    address: v.string(),
    lat: v.float64(),
    lng: v.float64(),
    website: v.optional(v.string()),
    note: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const name = limited(requireText(args.name, "Name"), MAX_NAME, "Name");
    const address = limited(requireText(args.address, "Address"), MAX_ADDRESS, "Address");
    assertCoordinates(args.lat, args.lng);
    const website = optionalText(args.website, MAX_WEBSITE, "Website");
    const note = optionalText(args.note, MAX_NOTE, "Note");

    const all = await ctx.db.query("stockists").collect();
    const orderIndex = all.reduce((max, s) => Math.max(max, s.orderIndex), -1) + 1;

    const id = await ctx.db.insert("stockists", {
      name,
      kind: args.kind,
      address,
      lat: args.lat,
      lng: args.lng,
      ...(website !== undefined ? { website } : {}),
      ...(note !== undefined ? { note } : {}),
      orderIndex,
      isActive: args.isActive ?? true,
    });
    await logActivity(ctx, { action: "Added stockist", section: "Stockists", details: truncateDetail(name) });
    return id;
  },
});

// Partial patch: only provided fields are written. Pass website or note as
// an empty string to clear it.
export const update = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("stockists"),
    name: v.optional(v.string()),
    kind: v.optional(kindValidator),
    address: v.optional(v.string()),
    lat: v.optional(v.float64()),
    lng: v.optional(v.float64()),
    website: v.optional(v.string()),
    note: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Stockist not found");
    if ((args.lat === undefined) !== (args.lng === undefined)) {
      throw new Error("Latitude and longitude must be updated together");
    }

    const patch: {
      name?: string;
      kind?: "restaurant" | "grocery";
      address?: string;
      lat?: number;
      lng?: number;
      website?: string | undefined;
      note?: string | undefined;
      isActive?: boolean;
    } = {};
    if (args.name !== undefined) patch.name = limited(requireText(args.name, "Name"), MAX_NAME, "Name");
    if (args.kind !== undefined) patch.kind = args.kind;
    if (args.address !== undefined) patch.address = limited(requireText(args.address, "Address"), MAX_ADDRESS, "Address");
    if (args.lat !== undefined && args.lng !== undefined) {
      assertCoordinates(args.lat, args.lng);
      patch.lat = args.lat;
      patch.lng = args.lng;
    }
    if (args.website !== undefined) patch.website = optionalText(args.website, MAX_WEBSITE, "Website");
    if (args.note !== undefined) patch.note = optionalText(args.note, MAX_NOTE, "Note");
    if (args.isActive !== undefined) patch.isActive = args.isActive;

    await ctx.db.patch(args.id, patch);
    await logActivity(ctx, {
      action: "Updated stockist",
      section: "Stockists",
      details: truncateDetail(patch.name ?? existing.name),
    });
  },
});

export const remove = mutation({
  args: { adminSecret: v.string(), id: v.id("stockists") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Stockist not found");
    await ctx.db.delete(args.id);
    await logActivity(ctx, { action: "Deleted stockist", section: "Stockists", details: truncateDetail(existing.name) });
  },
});

// Atomically reorder every stockist: orderIndex = position in the id list.
// Throws, rolling everything back, on any unknown id.
export const reorder = mutation({
  args: { adminSecret: v.string(), ids: v.array(v.id("stockists")) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    for (let i = 0; i < args.ids.length; i++) {
      const doc = await ctx.db.get(args.ids[i]);
      if (!doc) throw new Error("Stockist not found; reorder aborted");
      await ctx.db.patch(args.ids[i], { orderIndex: i });
    }
    await logActivity(ctx, { action: "Reordered stockists", section: "Stockists" });
  },
});
