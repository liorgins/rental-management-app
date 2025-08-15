import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */

  // Enable better debugging and development support
  experimental: {
    // Better source maps for debugging
    optimizePackageImports: ["lucide-react", "@tabler/icons-react"],
    // Enable Turbopack optimizations
    turbo: {
      rules: {
        // Optimize specific file types for faster compilation
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  // Improve development experience
  webpack: (config, { dev, isServer }) => {
    // Only apply webpack config when NOT using Turbopack
    if (process.env.TURBOPACK !== "1") {
      if (dev && !isServer) {
        // Better source maps for client-side debugging
        config.devtool = "eval-source-map"
      }

      if (dev && isServer) {
        // Better source maps for server-side debugging
        config.devtool = "source-map"
      }
    }

    return config
  },
}

export default nextConfig
