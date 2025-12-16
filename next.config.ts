import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/gen": path.resolve(__dirname, "src/gen"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@/gen": "./src/gen",
    },
  },
};

export default nextConfig;
