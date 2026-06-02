import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: true, // Allow local /public/images without remote domains
  },
  // Vercel deploy optimization
  output: "standalone",
};

export default nextConfig;
