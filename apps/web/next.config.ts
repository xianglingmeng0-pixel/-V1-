import type { NextConfig } from "next";

const isEdgeOneStaticExport =
  process.env.EDGEONE_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isEdgeOneStaticExport ? "export" : "standalone",
  trailingSlash: isEdgeOneStaticExport,
  images: {
    unoptimized: isEdgeOneStaticExport,
  },
  transpilePackages: ["@yanji/contracts"],
};

export default nextConfig;
