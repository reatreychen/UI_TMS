import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Serve customer dashboard at the root URL — URL stays as localhost:3000
        source: "/",
        destination: "/customer/dashboard",
      },
    ];
  },
};

module.exports = nextConfig;
