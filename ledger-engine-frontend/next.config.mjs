import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Enable React Strict Mode for development best practices */
  reactStrictMode: true,

  /* Enable gzip compression */
  compress: true,

  /* Proxy API requests to backend */
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  /* Optimize images: modern formats, long cache TTL */
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ledger-engine.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },

  /* Experimental features */
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  /* Production optimizations */
  poweredByHeader: false,
  generateEtags: true,
};

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");
export default withBundleAnalyzer(withNextIntl(nextConfig));
