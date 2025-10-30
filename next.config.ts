import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance Optimizations */

  // Compress responses
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize images - unoptimized for Netlify
  images: {
    unoptimized: true,
  },

  // Ignore ESLint errors during build (Netlify compatibility)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
