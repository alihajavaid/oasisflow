import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  basePath,
  experimental: {
    cpus: Number(process.env.NEXT_BUILD_CPUS) || 1,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "oasisflowwater.com" },
      { protocol: "https", hostname: "*.tile.openstreetmap.org" },
    ],
  },
};

export default nextConfig;
