import {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  initializeData,
  updateExpense,
} from "@/lib/kv-service"
import type { Expense } from "@/lib/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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
    queryFn: async () => {
      // Initialize data on first load
      await initializeData()
      return getExpenses()
    },
  })
}

// Get single expense
export function useExpense(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EXPENSE(id),
    queryFn: () => getExpense(id),
    enabled: !!id,
  })
}

// Get expenses for a specific unit
export function useUnitExpenses(unitId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.UNIT_EXPENSES(unitId),
    queryFn: async () => {
      const expenses = await getExpenses()
      return expenses.filter(
        (expense) => expense.scope === "Unit" && expense.unitId === unitId
      )
    },
    enabled: !!unitId,
  })
}

// Get global expenses
export function useGlobalExpenses() {
  return useQuery({
    queryKey: ["expenses", "global"],
    queryFn: async () => {
      const expenses = await getExpenses()
      return expenses.filter((expense) => expense.scope === "Global")
    },
  })
}

// Create expense mutation
export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createExpense,
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
      updateExpense(id, updates),
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
    mutationFn: deleteExpense,
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
    queryFn: async () => {
      const expenses = await getExpenses()

      const yearlyExpenses = expenses.reduce((total, expense) => {
        const expenseDate = new Date(expense.date)

        if (expense.recurrence === "Monthly") {
          return total + expense.amount * 12
        } else if (expense.recurrence === "Yearly") {
          return total + expense.amount
        } else if (
          expense.recurrence === "One-time" &&
          expenseDate.getFullYear() === currentYear
        ) {
          return total + expense.amount
        }

        return total
      }, 0)

      const monthlyExpenses = expenses
        .filter((e) => e.recurrence === "Monthly")
        .reduce((total, expense) => total + expense.amount, 0)

      const yearlyRecurring = expenses
        .filter((e) => e.recurrence === "Yearly")
        .reduce((total, expense) => total + expense.amount, 0)

      const oneTimeThisYear = expenses
        .filter((e) => {
          const expenseDate = new Date(e.date)
          return (
            e.recurrence === "One-time" &&
            expenseDate.getFullYear() === currentYear
          )
        })
        .reduce((total, expense) => total + expense.amount, 0)

      return {
        totalYearly: yearlyExpenses,
        monthlyRecurring: monthlyExpenses,
        yearlyRecurring,
        oneTimeThisYear,
      }
    },
  })
}


