import { isBrowser, redis, STORAGE_KEYS } from "./kv"
import { sampleUnits, seedExpenses } from "./sample-data"
import type { Expense, Unit } from "./types"

// Fallback to localStorage when KV is not available (development mode)
const localStorage = isBrowser ? window.localStorage : null

// Units operations
export async function getUnits(): Promise<Unit[]> {
  try {
    // Try Upstash KV first
    const units = await redis.get<Unit[]>(STORAGE_KEYS.UNITS)
    if (units && Array.isArray(units)) {
      return units
    }
  } catch (error) {
    console.warn(
      "Failed to fetch from KV, falling back to localStorage:",
      error
    )
  }

  // Fallback to localStorage
  if (localStorage) {
    try {
      const stored = localStorage.getItem("rental.units")
      if (stored) {
        return JSON.parse(stored) as Unit[]
      }
    } catch (error) {
      console.warn("Failed to fetch from localStorage:", error)
    }
  }

  // Return sample data as last resort
  return sampleUnits
}

export async function saveUnits(units: Unit[]): Promise<void> {
  try {
    // Save to KV
    await redis.set(STORAGE_KEYS.UNITS, units)
  } catch (error) {
    console.warn("Failed to save to KV, falling back to localStorage:", error)

    // Fallback to localStorage
    if (localStorage) {
      localStorage.setItem("rental.units", JSON.stringify(units))
    }
  }
}

export async function getUnit(id: string): Promise<Unit | null> {
  const units = await getUnits()
  return units.find((unit) => unit.id === id) || null
}

export async function createUnit(unit: Unit): Promise<Unit> {
  const units = await getUnits()
  const newUnits = [...units, unit]
  await saveUnits(newUnits)
  return unit
}

export async function updateUnit(
  id: string,
  updates: Partial<Unit>
): Promise<Unit | null> {
  const units = await getUnits()
  const index = units.findIndex((unit) => unit.id === id)

  if (index === -1) {
    return null
  }

  const updatedUnit = { ...units[index], ...updates }
  const newUnits = [...units]
  newUnits[index] = updatedUnit

  await saveUnits(newUnits)
  return updatedUnit
}

export async function deleteUnit(id: string): Promise<boolean> {
  const units = await getUnits()
  const filteredUnits = units.filter((unit) => unit.id !== id)

  if (filteredUnits.length === units.length) {
    return false // Unit not found
  }

  await saveUnits(filteredUnits)
  return true
}

// Expenses operations
export async function getExpenses(): Promise<Expense[]> {
  try {
    // Try Upstash KV first
    const expenses = await redis.get<Expense[]>(STORAGE_KEYS.EXPENSES)
    if (expenses && Array.isArray(expenses)) {
      return expenses
    }
  } catch (error) {
    console.warn(
      "Failed to fetch expenses from KV, falling back to localStorage:",
      error
    )
  }

  // Fallback to localStorage
  if (localStorage) {
    try {
      const stored = localStorage.getItem("rental.expenses")
      if (stored) {
        return JSON.parse(stored) as Expense[]
      }
    } catch (error) {
      console.warn("Failed to fetch expenses from localStorage:", error)
    }
  }

  // Return sample data as last resort
  return seedExpenses
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  try {
    // Save to KV
    await redis.set(STORAGE_KEYS.EXPENSES, expenses)
  } catch (error) {
    console.warn(
      "Failed to save expenses to KV, falling back to localStorage:",
      error
    )

    // Fallback to localStorage
    if (localStorage) {
      localStorage.setItem("rental.expenses", JSON.stringify(expenses))
    }
  }
}

export async function getExpense(id: string): Promise<Expense | null> {
  const expenses = await getExpenses()
  return expenses.find((expense) => expense.id === id) || null
}

export async function createExpense(expense: Expense): Promise<Expense> {
  const expenses = await getExpenses()
  const newExpenses = [expense, ...expenses] // Add to beginning
  await saveExpenses(newExpenses)
  return expense
}

export async function updateExpense(
  id: string,
  updates: Partial<Expense>
): Promise<Expense | null> {
  const expenses = await getExpenses()
  const index = expenses.findIndex((expense) => expense.id === id)

  if (index === -1) {
    return null
  }

  const updatedExpense = { ...expenses[index], ...updates }
  const newExpenses = [...expenses]
  newExpenses[index] = updatedExpense

  await saveExpenses(newExpenses)
  return updatedExpense
}

export async function deleteExpense(id: string): Promise<boolean> {
  const expenses = await getExpenses()
  const filteredExpenses = expenses.filter((expense) => expense.id !== id)

  if (filteredExpenses.length === expenses.length) {
    return false // Expense not found
  }

  await saveExpenses(filteredExpenses)
  return true
}

// Initialize data (migrate from localStorage if needed)
export async function initializeData(): Promise<void> {
  try {
    const isInitialized = await redis.get<boolean>(STORAGE_KEYS.INITIALIZED)

    if (!isInitialized) {
      // Check if we have data in localStorage to migrate
      if (localStorage) {
        const localUnits = localStorage.getItem("rental.units")
        const localExpenses = localStorage.getItem("rental.expenses")

        if (localUnits) {
          try {
            const units = JSON.parse(localUnits) as Unit[]
            await saveUnits(units)
            console.log("Migrated units from localStorage to KV")
          } catch (error) {
            console.warn("Failed to migrate units from localStorage:", error)
          }
        } else {
          // No local data, use sample data
          await saveUnits(sampleUnits)
        }

        if (localExpenses) {
          try {
            const expenses = JSON.parse(localExpenses) as Expense[]
            await saveExpenses(expenses)
            console.log("Migrated expenses from localStorage to KV")
          } catch (error) {
            console.warn("Failed to migrate expenses from localStorage:", error)
          }
        } else {
          // No local data, use sample data
          await saveExpenses(seedExpenses)
        }
      } else {
        // Server-side or no localStorage, use sample data
        await saveUnits(sampleUnits)
        await saveExpenses(seedExpenses)
      }

      // Mark as initialized
      await redis.set(STORAGE_KEYS.INITIALIZED, true)
      console.log("Data initialization completed")
    }
  } catch (error) {
    console.warn("Failed to initialize data:", error)
    // If initialization fails, we'll fall back to localStorage or sample data
  }
}


