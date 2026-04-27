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

  // FAQs — CMS-managed
  faqs: defineTable({
    question: v.string(),
    answer: v.string(),
    orderIndex: v.float64(),
    isActive: v.boolean(),
  }),

  // Testimonials — CMS-managed
  testimonials: defineTable({
    author: v.string(),
    role: v.optional(v.string()),    // e.g. "Wedding Client" or "CEO, Victoria Tech Group"
    text: v.string(),
    rating: v.optional(v.float64()), // 1-5
    orderIndex: v.float64(),
    isActive: v.boolean(),
  }),

  // Activity log — tracks CMS changes
  activityLog: defineTable({
    action: v.string(),        // e.g. "Updated site content", "Added FAQ", "Toggled banner"
    section: v.string(),       // e.g. "Site Content", "FAQ", "Banner"
    details: v.optional(v.string()),
    performedAt: v.float64(),  // timestamp ms
  }).index("by_performedAt", ["performedAt"]),
});
