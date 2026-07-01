"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Only the admin tree needs the reactive client (admin/media uses useQuery).
// Public pages read Convex server-side via src/lib/cms.ts.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  if (!convex) {
    // Misconfigured deploy (missing NEXT_PUBLIC_CONVEX_URL): render without
    // live queries instead of crashing the whole tree.
    console.error("[convex] NEXT_PUBLIC_CONVEX_URL is not set");
    return <>{children}</>;
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
