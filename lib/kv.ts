import { Redis } from "@upstash/redis"

// Initialize Redis client
// You'll need to set these environment variables:
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Storage keys
export const STORAGE_KEYS = {
  UNITS: "rental:units",
  EXPENSES: "rental:expenses",
  INCOMES: "rental:incomes",
  INITIALIZED: "rental:initialized",
} as const

// Check if running in browser (for fallback to localStorage during development)
export const isServer = typeof window === "undefined"
export const isBrowser = !isServer
