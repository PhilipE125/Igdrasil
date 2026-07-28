import type { NextConfig } from "next";

const rootDir = process.cwd();

const nextConfig: NextConfig = {
  distDir: ".cache/next",
  // Static export — every route is prerendered, so the site ships to S3 as
  // plain files behind CloudFront. No Node server in production.
  output: "export",
  // Emits `privacy/index.html` rather than `privacy.html`, so CloudFront can
  // resolve a directory request with a single URI rewrite.
  trailingSlash: true,
  // The Next image optimizer needs a server; without one, serve sources as-is.
  images: { unoptimized: true },
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
