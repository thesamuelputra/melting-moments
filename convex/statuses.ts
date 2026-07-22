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
