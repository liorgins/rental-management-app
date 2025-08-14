import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { Unit } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as NIS currency
 */
export function formatNIS(amount: number): string {
  return `₪${amount.toLocaleString()}`
}

/**
 * Calculates if a contract is ending soon (within 3 months)
 */
export function isContractEndingSoon(contractEndDate?: string): boolean {
  if (!contractEndDate) return false

  const today = new Date()
  const endDate = new Date(contractEndDate)
  const daysUntilEnd = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysUntilEnd >= 0 && daysUntilEnd <= 90 // 3 months = 90 days
}

/**
 * Gets the contract status label for a unit
 */
export function getContractStatus(
  unit: Unit
): "Active" | "Ending soon" | "Ended" {
  if (!unit.contractEnd) return "Active"

  const today = new Date()
  const endDate = new Date(unit.contractEnd)
  const daysUntilEnd = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntilEnd < 0) return "Ended"
  if (daysUntilEnd <= 90) return "Ending soon" // 3 months = 90 days
  return "Active"
}

/**
 * Gets the number of days until contract end
 */
export function getDaysUntilContractEnd(
  contractEndDate?: string
): number | null {
  if (!contractEndDate) return null

  const today = new Date()
  const endDate = new Date(contractEndDate)
  return Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
}
