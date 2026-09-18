import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Rewrites these barrel-file imports to direct module paths at build
    // time, so a page using one icon doesn't pull the whole icon package
    // into its bundle.
    optimizePackageImports: ["lucide-react", "react-icons", "react-useanimations"],
  },
};

export default nextConfig;
