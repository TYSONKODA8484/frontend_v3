import type { NextConfig } from "next";

// Private, signed-in areas must never appear in search results.
const NOINDEX_PATHS = ["/studio/:path*", "/auth/:path*", "/invite/:path*"];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      ...NOINDEX_PATHS.map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      })),
    ];
  },
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
