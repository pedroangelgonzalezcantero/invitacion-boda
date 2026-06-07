import type { NextConfig } from "next";

// Bypass SSL certificate validation in local development (Windows cert store issue)
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: true, // Allow local /public/images without remote domains
  },
  // Vercel deploy optimization
  output: "standalone",
};

export default nextConfig;
