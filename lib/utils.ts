import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as NIS currency
 */
export function formatNIS(amount: number): string {
  return `₪${amount.toLocaleString()}`
}
