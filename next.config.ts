import type { NextConfig } from "next";

const isNetlify = process.env.NETLIFY === "true";

const nextConfig: NextConfig = {
  // Netlify serves this browser-only game as a static export. The existing
  // Vinext/Cloudflare build remains unchanged everywhere else.
  output: isNetlify ? "export" : undefined,
  typescript: isNetlify
    ? { tsconfigPath: "tsconfig.netlify.json" }
    : undefined,
};

export default nextConfig;
