import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  basePath,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "oasisflowwater.com" },
      { protocol: "https", hostname: "*.tile.openstreetmap.org" },
    ],
  },
};

export default nextConfig;
