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
    // "new" | "contacted" | "booked" | "declined" | "archived"; enforced at
    // mutation args (INQUIRY_STATUSES in convex/lib.ts). The schema stays
    // v.string() so existing rows remain valid.
    status: v.string(),
    notes: v.string(), // customer-submitted, immutable after create
    adminNotes: v.optional(v.string()), // admin-editable internal notes
    // Status the inquiry had before being archived; used by inquiries.restore.
    archivedFromStatus: v.optional(v.string()),
    submittedAt: v.float64(), // timestamp ms
  }).index("by_status", ["status"])
    .index("by_submittedAt", ["submittedAt"]),

  businessSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  // Fixed-window rate limit counters, keyed by "<route>:<ip>" (for example
  // "contact:1.2.3.4"). Written only by rateLimits.hit, which the public API
  // routes call server-side. This is the authoritative limiter; the
  // in-memory one in src/proxy.ts is per-isolate on Vercel and only a
  // best-effort front line. Stale rows are cleaned up opportunistically.
  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.float64(), // timestamp ms when the current window opened
    count: v.float64(),       // requests seen in the current window
  }).index("by_key", ["key"]),

  // FAQs (CMS-managed)
  faqs: defineTable({
    question: v.string(),
    answer: v.string(),
    // Which brand the FAQ belongs to; undefined = general/common questions.
    category: v.optional(v.union(v.literal("catering"), v.literal("guidos"))),
    orderIndex: v.float64(),
    isActive: v.boolean(),
  }),

  // Testimonials (CMS-managed)
  testimonials: defineTable({
    author: v.string(),
    role: v.optional(v.string()),    // e.g. "Wedding Client" or "CEO, Victoria Tech Group"
    text: v.string(),
    rating: v.optional(v.float64()), // 1-5 integer, enforced at mutation args
    // "catering" | "guidos" | undefined (shows on both); enforced at mutation
    // args. The schema stays v.string() so existing rows remain valid.
    brand: v.optional(v.string()),
    orderIndex: v.float64(),
    isActive: v.boolean(),
  }),

  // Activity log: tracks CMS changes
  activityLog: defineTable({
    action: v.string(),        // e.g. "Updated site content", "Added FAQ", "Toggled banner"
    section: v.string(),       // e.g. "Site Content", "FAQ", "Banner"
    details: v.optional(v.string()),
    performedAt: v.float64(),  // timestamp ms
  }).index("by_performedAt", ["performedAt"]),

  // Guido's Gourmet products (CMS-managed)
  guidosProducts: defineTable({
    name: v.string(),
    category: v.string(),
    priceFrom: v.float64(),
    sizes: v.optional(v.array(v.object({
      label: v.string(),
      price: v.float64(),
    }))),
    image: v.optional(v.string()),
    isAvailable: v.boolean(),
    isLimitedEdition: v.boolean(),
    orderIndex: v.float64(),
  }).index("by_category", ["category"]),

  // Dormant: the media module was removed; table retained so existing rows stay valid
  siteImages: defineTable({
    storageId: v.id("_storage"),
    title: v.string(),
    alt: v.string(),
    section: v.optional(v.string()), // "gallery" | "hero" | "about" | etc.
    orderIndex: v.float64(),
    uploadedAt: v.float64(),
  }).index("by_section", ["section"])
    .index("by_uploadedAt", ["uploadedAt"]),

  // Guido's Gourmet orders
  guidosOrders: defineTable({
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    items: v.string(),
    // "delivery" | "pickup"; enforced at guidosOrders.create args. The
    // schema stays v.string() so existing rows remain valid.
    deliveryMethod: v.string(),
    deliveryAddress: v.optional(v.string()),
    notes: v.optional(v.string()),
    // "received" | "preparing" | "ready" | "delivered" | "picked_up";
    // enforced at mutation args (ORDER_STATUSES in convex/lib.ts).
    status: v.string(),
    submittedAt: v.float64(), // timestamp ms
  }).index("by_status", ["status"])
    .index("by_submittedAt", ["submittedAt"]),
});
