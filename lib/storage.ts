"use client"

import type { Expense } from "./types"
import { seedExpenses } from "./sample-data"

const EXPENSES_KEY = "rental.expenses"
const INIT_KEY = "rental.initialized"

export function initLocalData() {
  try {
    const initialized = localStorage.getItem(INIT_KEY)
    if (!initialized) {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(seedExpenses))
      localStorage.setItem(INIT_KEY, "true")
    }
  } catch {
    // no-op
  }
}

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Expense[]
  } catch {
    return []
  }
}

export function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
}
