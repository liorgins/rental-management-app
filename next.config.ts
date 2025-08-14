import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */

  // Enable better debugging support
  experimental: {
    // Better source maps for debugging
    optimizePackageImports: ["lucide-react", "@tabler/icons-react"],
  },

  // Improve development experience
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Better source maps for client-side debugging
      config.devtool = "eval-source-map"
    }

    if (dev && isServer) {
      // Better source maps for server-side debugging
      config.devtool = "source-map"
    }

    return config
  },
}

export default nextConfig
