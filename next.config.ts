import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: undefined, // next-on-pages requires the default output mode
  images: { unoptimized: true }, // Cloudflare Pages does not support the Next image optimizer
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // Keep server actions/edge-compatible defaults for next-on-pages
  },
};

export default nextConfig;
