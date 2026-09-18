import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Rewrites these barrel-file imports to direct module paths at build
    // time, so a page using one icon doesn't pull the whole icon package
    // into its bundle.
    optimizePackageImports: ["lucide-react", "react-icons", "react-useanimations"],
  },
  images: {
    // Generated photo URLs come from the backend's storage/CDN, whose exact
    // hostname isn't confirmed yet (and may change). Wildcarding https here
    // — rather than guessing a specific host that could be wrong and break
    // every image — is Next's documented way to allow any remote source;
    // narrow this to the real hostname once it's confirmed.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
