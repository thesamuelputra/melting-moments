// Status enums, enforced at mutation args via v.union(v.literal(...)).
// Schema fields stay v.string() so existing rows remain valid.
// This module holds only constants and types so Next.js code can import it
// without pulling in Convex server internals.
export const INQUIRY_STATUSES = [
  "new",
  "contacted",
  "booked",
  "declined",
  "archived",
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const ORDER_STATUSES = [
  "received",
  "preparing",
  "ready",
  "delivered",
  "picked_up",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Kinds of place that stock Guido's Gourmet (the /guidos map and the admin
// Stockists module). Not a status, but kept here for the same reason: Next.js
// code imports it without Convex server internals.
export const STOCKIST_KINDS = ["restaurant", "grocery"] as const;
export type StockistKind = (typeof STOCKIST_KINDS)[number];
