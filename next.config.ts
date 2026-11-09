import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers are managed exclusively by src/proxy.ts to avoid
  // duplication. See proxy.ts addSecurityHeaders() for the full set
  // including CSP, X-Frame-Options, etc.
  // Drop the x-powered-by: Next.js header (avoid advertising the stack).
  poweredByHeader: false,
  async redirects() {
    return [
      // The catering overview page was folded into the home page, which already
      // introduces both brands, so its address and the retired pages that once
      // pointed at it all land on the home page now.
      { source: '/catering', destination: '/', permanent: true },
      { source: '/gallery', destination: '/', permanent: true },
      { source: '/family-style', destination: '/', permanent: true },
      { source: '/fountains', destination: '/', permanent: true },
      // The catering offer narrowed to weddings and events. Corporate and
      // private functions both live on the events page now.
      { source: '/corporate', destination: '/events', permanent: true },
      { source: '/private-events', destination: '/events', permanent: true },
      // The Guido's menu is the Guido's page itself now
      { source: '/guidos/menu', destination: '/guidos', permanent: true },
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
