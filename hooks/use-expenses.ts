import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Expense } from "@/lib/types"

// API functions
async function fetchExpenses(params?: {
  unitId?: string
  scope?: string
}): Promise<Expense[]> {
  const searchParams = new URLSearchParams()
  if (params?.unitId) searchParams.set("unitId", params.unitId)
  if (params?.scope) searchParams.set("scope", params.scope)

  const url = `/api/expenses${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch expenses")
  }
  return response.json()
}

async function fetchExpense(id: string): Promise<Expense | null> {
  const response = await fetch(`/api/expenses/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error("Failed to fetch expense")
  }
  return response.json()
}

async function createExpenseAPI(expense: Expense): Promise<Expense> {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  })
  if (!response.ok) {
    throw new Error("Failed to create expense")
  }
  return response.json()
}

async function updateExpenseAPI(
  id: string,
  updates: Partial<Expense>
): Promise<Expense | null> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  })
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error("Failed to update expense")
  }
  return response.json()
}

async function deleteExpenseAPI(id: string): Promise<boolean> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    if (response.status === 404) {
      return false
    }
    throw new Error("Failed to delete expense")
  }
  const result = await response.json()
  return result.success
}

async function fetchExpenseStats(year?: number): Promise<{
  totalYearly: number
  monthlyRecurring: number
  yearlyRecurring: number
  oneTimeThisYear: number
}> {
  const searchParams = new URLSearchParams()
  if (year) searchParams.set("year", year.toString())

  const url = `/api/expenses/stats${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch expense stats")
  }
  return response.json()
}

// Query keys
export const QUERY_KEYS = {
  EXPENSES: ["expenses"] as const,
  EXPENSE: (id: string) => ["expenses", id] as const,
  UNIT_EXPENSES: (unitId: string) => ["expenses", "unit", unitId] as const,
}

// Get all expenses
export function useExpenses() {
  return useQuery({
    queryKey: QUERY_KEYS.EXPENSES,
    queryFn: () => fetchExpenses(),
  })
}

// Get single expense
export function useExpense(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EXPENSE(id),
    queryFn: () => fetchExpense(id),
    enabled: !!id,
  })
}

// Get expenses for a specific unit
export function useUnitExpenses(unitId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.UNIT_EXPENSES(unitId),
    queryFn: () => fetchExpenses({ unitId }),
    enabled: !!unitId,
  })
}

// Get global expenses
export function useGlobalExpenses() {
  return useQuery({
    queryKey: ["expenses", "global"],
    queryFn: () => fetchExpenses({ scope: "global" }),
  })
}

// Create expense mutation
export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createExpenseAPI,
    onSuccess: (newExpense) => {
      // Update expenses list (add to beginning)
      queryClient.setQueryData(QUERY_KEYS.EXPENSES, (old: Expense[] = []) => [
        newExpense,
        ...old,
      ])

      // Update unit-specific expenses if applicable
      if (newExpense.scope === "Unit" && newExpense.unitId) {
        queryClient.setQueryData(
          QUERY_KEYS.UNIT_EXPENSES(newExpense.unitId),
          (old: Expense[] = []) => [newExpense, ...old]
        )
      }

      // Update global expenses if applicable
      if (newExpense.scope === "Global") {
        queryClient.setQueryData(
          ["expenses", "global"],
          (old: Expense[] = []) => [newExpense, ...old]
        )
      }

      // Set the new expense in cache
      queryClient.setQueryData(QUERY_KEYS.EXPENSE(newExpense.id), newExpense)
    },
    onError: (error) => {
      console.error("Failed to create expense:", error)
    },
  })
}

// Update expense mutation
export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Expense> }) =>
      updateExpenseAPI(id, updates),
    onSuccess: (updatedExpense) => {
      if (updatedExpense) {
        // Update expenses list
        queryClient.setQueryData(QUERY_KEYS.EXPENSES, (old: Expense[] = []) =>
          old.map((expense) =>
            expense.id === updatedExpense.id ? updatedExpense : expense
          )
        )

        // Update unit-specific expenses if applicable
        if (updatedExpense.scope === "Unit" && updatedExpense.unitId) {
          queryClient.setQueryData(
            QUERY_KEYS.UNIT_EXPENSES(updatedExpense.unitId),
            (old: Expense[] = []) =>
              old.map((expense) =>
                expense.id === updatedExpense.id ? updatedExpense : expense
              )
          )
        }

        // Update global expenses if applicable
        if (updatedExpense.scope === "Global") {
          queryClient.setQueryData(
            ["expenses", "global"],
            (old: Expense[] = []) =>
              old.map((expense) =>
                expense.id === updatedExpense.id ? updatedExpense : expense
              )
          )
        }

        // Update single expense cache
        queryClient.setQueryData(
          QUERY_KEYS.EXPENSE(updatedExpense.id),
          updatedExpense
        )
      }
    },
    onError: (error) => {
      console.error("Failed to update expense:", error)
    },
  })
}

// Delete expense mutation
export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteExpenseAPI,
    onSuccess: (success, deletedId) => {
      if (success) {
        // Get the expense before deletion to know which caches to update
        const deletedExpense = queryClient.getQueryData<Expense>(
          QUERY_KEYS.EXPENSE(deletedId)
        )

        // Remove from expenses list
        queryClient.setQueryData(QUERY_KEYS.EXPENSES, (old: Expense[] = []) =>
          old.filter((expense) => expense.id !== deletedId)
        )

        // Remove from unit-specific expenses if applicable
        if (deletedExpense?.scope === "Unit" && deletedExpense.unitId) {
          queryClient.setQueryData(
            QUERY_KEYS.UNIT_EXPENSES(deletedExpense.unitId),
            (old: Expense[] = []) =>
              old.filter((expense) => expense.id !== deletedId)
          )
        }

        // Remove from global expenses if applicable
        if (deletedExpense?.scope === "Global") {
          queryClient.setQueryData(
            ["expenses", "global"],
            (old: Expense[] = []) =>
              old.filter((expense) => expense.id !== deletedId)
          )
        }

        // Remove single expense from cache
        queryClient.removeQueries({ queryKey: QUERY_KEYS.EXPENSE(deletedId) })
      }
    },
    onError: (error) => {
      console.error("Failed to delete expense:", error)
    },
  })
}

// Helper hook for expense statistics
export function useExpenseStats(year?: number) {
  const currentYear = year || new Date().getFullYear()

  return useQuery({
    queryKey: ["expense-stats", currentYear],
    queryFn: () => fetchExpenseStats(currentYear),
  })
}
