import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'r2.limitlesstcg.net',
      },
    ],
  },
};

export default nextConfig;
