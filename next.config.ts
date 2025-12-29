import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "https", hostname: "cdn.wallper.app" },
      { protocol: "http", hostname: "57.129.86.35", port: "9000" },
    ],
    formats: ["image/webp", "image/avif"],
  },
  compress: true,
  poweredByHeader: false,
  experimental: { optimizeCss: true },
};

export default nextConfig;
