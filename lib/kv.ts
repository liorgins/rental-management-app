import { Redis } from "@upstash/redis"

// Initialize Redis client
// You'll need to set these environment variables:
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Storage keys
export const STORAGE_KEYS = {
  UNITS: "rental:units",
  EXPENSES: "rental:expenses",
  INITIALIZED: "rental:initialized",
} as const

// Check if running in browser (for fallback to localStorage during development)
export const isServer = typeof window === "undefined"
export const isBrowser = !isServer


