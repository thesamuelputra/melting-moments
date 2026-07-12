import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers are managed exclusively by src/proxy.ts to avoid
  // duplication. See proxy.ts addSecurityHeaders() for the full set
  // including CSP, X-Frame-Options, etc.
  async redirects() {
    return [
      // The gallery page was removed; send any stale links to the brand hub
      { source: '/gallery', destination: '/catering', permanent: true },
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
