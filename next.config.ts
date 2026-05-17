import type { NextConfig } from "next";

export default {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*.glb",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Content-Type", value: "model/gltf-binary" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/:path*.{webp,png,jpg,jpeg,svg,ico,avif}",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
} satisfies NextConfig;
