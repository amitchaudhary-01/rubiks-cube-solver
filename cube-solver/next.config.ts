import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Make sure output: 'export' is NOT here!
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;