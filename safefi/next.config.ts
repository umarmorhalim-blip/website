import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the whole page is pre-rendered HTML that any CDN can serve.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
