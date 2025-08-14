import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Income } from "@/lib/types"

// API functions
async function fetchIncomes(params?: {
  unitId?: string
  type?: string
}): Promise<Income[]> {
  const searchParams = new URLSearchParams()
  if (params?.unitId) searchParams.set("unitId", params.unitId)
  if (params?.type) searchParams.set("type", params.type)

  const url = `/api/income${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch incomes")
  }
  return response.json()
}

async function fetchIncome(id: string): Promise<Income | null> {
  const response = await fetch(`/api/income/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error("Failed to fetch income")
  }
  return response.json()
}

async function createIncomeAPI(income: Income): Promise<Income> {
  const response = await fetch("/api/income", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(income),
  })
  if (!response.ok) {
    throw new Error("Failed to create income")
  }
  return response.json()
}

async function updateIncomeAPI(
  id: string,
  updates: Partial<Income>
): Promise<Income | null> {
  const response = await fetch(`/api/income/${id}`, {
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
    throw new Error("Failed to update income")
  }
  return response.json()
}

async function deleteIncomeAPI(id: string): Promise<boolean> {
  const response = await fetch(`/api/income/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    if (response.status === 404) {
      return false
    }
    throw new Error("Failed to delete income")
  }
  const result = await response.json()
  return result.success
}

// Query keys
export const QUERY_KEYS = {
  INCOMES: ["incomes"] as const,
  INCOME: (id: string) => ["incomes", id] as const,
  UNIT_INCOMES: (unitId: string) => ["incomes", "unit", unitId] as const,
}

// Get all incomes
export function useIncomes() {
  return useQuery({
    queryKey: QUERY_KEYS.INCOMES,
    queryFn: () => fetchIncomes(),
  })
}

// Get single income
export function useIncome(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.INCOME(id),
    queryFn: () => fetchIncome(id),
    enabled: !!id,
  })
}

// Get incomes for a specific unit
export function useUnitIncomes(unitId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.UNIT_INCOMES(unitId),
    queryFn: () => fetchIncomes({ unitId }),
    enabled: !!unitId,
  })
}

// Get general incomes
export function useGeneralIncomes() {
  return useQuery({
    queryKey: ["incomes", "general"],
    queryFn: () => fetchIncomes({ type: "General" }),
  })
}

// Create income mutation
export function useCreateIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createIncomeAPI,
    onSuccess: (newIncome) => {
      // Update incomes list (add to beginning)
      queryClient.setQueryData(QUERY_KEYS.INCOMES, (old: Income[] = []) => [
        newIncome,
        ...old,
      ])

      // Update unit-specific incomes if applicable
      if (newIncome.scope === "Unit" && newIncome.unitId) {
        queryClient.setQueryData(
          QUERY_KEYS.UNIT_INCOMES(newIncome.unitId),
          (old: Income[] = []) => [newIncome, ...old]
        )
      }

      // Update general incomes if applicable
      if (newIncome.scope === "Global") {
        queryClient.setQueryData(
          ["incomes", "general"],
          (old: Income[] = []) => [newIncome, ...old]
        )
      }

      // Set the new income in cache
      queryClient.setQueryData(QUERY_KEYS.INCOME(newIncome.id), newIncome)
    },
    onError: (error) => {
      console.error("Failed to create income:", error)
    },
  })
}

// Update income mutation
export function useUpdateIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Income> }) =>
      updateIncomeAPI(id, updates),
    onSuccess: (updatedIncome) => {
      if (updatedIncome) {
        // Update incomes list
        queryClient.setQueryData(QUERY_KEYS.INCOMES, (old: Income[] = []) =>
          old.map((income) =>
            income.id === updatedIncome.id ? updatedIncome : income
          )
        )

        // Update unit-specific incomes if applicable
        if (updatedIncome.scope === "Unit" && updatedIncome.unitId) {
          queryClient.setQueryData(
            QUERY_KEYS.UNIT_INCOMES(updatedIncome.unitId),
            (old: Income[] = []) =>
              old.map((income) =>
                income.id === updatedIncome.id ? updatedIncome : income
              )
          )
        }

        // Update general incomes if applicable
        if (updatedIncome.scope === "Global") {
          queryClient.setQueryData(
            ["incomes", "general"],
            (old: Income[] = []) =>
              old.map((income) =>
                income.id === updatedIncome.id ? updatedIncome : income
              )
          )
        }

        // Update single income cache
        queryClient.setQueryData(
          QUERY_KEYS.INCOME(updatedIncome.id),
          updatedIncome
        )
      }
    },
    onError: (error) => {
      console.error("Failed to update income:", error)
    },
  })
}

// Delete income mutation
export function useDeleteIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteIncomeAPI,
    onSuccess: (success, deletedId) => {
      if (success) {
        // Get the income before deletion to know which caches to update
        const deletedIncome = queryClient.getQueryData<Income>(
          QUERY_KEYS.INCOME(deletedId)
        )

        // Remove from incomes list
        queryClient.setQueryData(QUERY_KEYS.INCOMES, (old: Income[] = []) =>
          old.filter((income) => income.id !== deletedId)
        )

        // Remove from unit-specific incomes if applicable
        if (deletedIncome?.scope === "Unit" && deletedIncome.unitId) {
          queryClient.setQueryData(
            QUERY_KEYS.UNIT_INCOMES(deletedIncome.unitId),
            (old: Income[] = []) =>
              old.filter((income) => income.id !== deletedId)
          )
        }

        // Remove from general incomes if applicable
        if (deletedIncome?.scope === "Global") {
          queryClient.setQueryData(
            ["incomes", "general"],
            (old: Income[] = []) =>
              old.filter((income) => income.id !== deletedId)
          )
        }

        // Remove single income from cache
        queryClient.removeQueries({ queryKey: QUERY_KEYS.INCOME(deletedId) })
      }
    },
    onError: (error) => {
      console.error("Failed to delete income:", error)
    },
  })
}
