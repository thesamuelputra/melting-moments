import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers are managed exclusively by src/proxy.ts to avoid
  // duplication. See proxy.ts addSecurityHeaders() for the full set
  // including CSP, X-Frame-Options, etc.
  // Drop the x-powered-by: Next.js header (avoid advertising the stack).
  poweredByHeader: false,
  async redirects() {
    return [
      // The gallery page was removed; send any stale links to the brand hub
      { source: '/gallery', destination: '/catering', permanent: true },
      // The catering offer narrowed to weddings and events. Corporate and
      // private functions both live on the events page now; the family-style
      // and fountain pages are gone, so their links land on the brand hub.
      { source: '/corporate', destination: '/events', permanent: true },
      { source: '/private-events', destination: '/events', permanent: true },
      { source: '/family-style', destination: '/catering', permanent: true },
      { source: '/fountains', destination: '/catering', permanent: true },
    ];
  },
  images: {
    // Prefer AVIF (smaller) then WebP. 100 intentionally not allowed: q75/q90
    // keep hero LCP bytes sane; q100 was 2-4x heavier for no visible gain.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
