import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  menuItems: defineTable({
    category: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.optional(v.float64()),
    priceLabel: v.string(),
    orderIndex: v.float64(),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
  }).index("by_category", ["category"]),

  inquiries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    eventType: v.string(),
    guestCount: v.string(),
    date: v.string(),
    venue: v.string(),
    status: v.string(), // "new" | "contacted" | "booked" | "declined" | "archived"
    notes: v.string(),
    submittedAt: v.float64(), // timestamp ms
  }).index("by_status", ["status"])
    .index("by_submittedAt", ["submittedAt"]),

  businessSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
