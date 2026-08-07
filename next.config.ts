import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home dir makes Turbopack guess the wrong root.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
