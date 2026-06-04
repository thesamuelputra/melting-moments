import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers are managed exclusively by src/proxy.ts to avoid
  // duplication. See proxy.ts addSecurityHeaders() for the full set
  // including CSP, X-Frame-Options, etc.
  images: {
    // Prefer AVIF (smaller) then WebP; allow the quality levels used by hero images
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
