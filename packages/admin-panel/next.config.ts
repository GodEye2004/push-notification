import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: "../../",
  },
  /* config options here */
};

export default nextConfig;
