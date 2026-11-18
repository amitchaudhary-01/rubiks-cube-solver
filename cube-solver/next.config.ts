import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // <-- This is mandatory to generate the static 'out' folder
  images: {
    unoptimized: true, // Recommended for static exports
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;