import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Unit } from "@/lib/types"

// API functions
async function fetchUnits(): Promise<Unit[]> {
  const response = await fetch("/api/units")
  if (!response.ok) {
    throw new Error("Failed to fetch units")
  }
  return response.json()
}

async function fetchUnit(id: string): Promise<Unit | null> {
  const response = await fetch(`/api/units/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error("Failed to fetch unit")
  }
  return response.json()
}

async function createUnitAPI(unit: Unit): Promise<Unit> {
  const response = await fetch("/api/units", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(unit),
  })
  if (!response.ok) {
    throw new Error("Failed to create unit")
  }
  return response.json()
}

async function updateUnitAPI(
  id: string,
  updates: Partial<Unit>
): Promise<Unit | null> {
  const response = await fetch(`/api/units/${id}`, {
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
    throw new Error("Failed to update unit")
  }
  return response.json()
}

async function deleteUnitAPI(id: string): Promise<boolean> {
  const response = await fetch(`/api/units/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    if (response.status === 404) {
      return false
    }
    throw new Error("Failed to delete unit")
  }
  const result = await response.json()
  return result.success
}

// Query keys
export const QUERY_KEYS = {
  UNITS: ["units"] as const,
  UNIT: (id: string) => ["units", id] as const,
}

// Get all units
export function useUnits() {
  return useQuery({
    queryKey: QUERY_KEYS.UNITS,
    queryFn: fetchUnits,
  })
}

// Get single unit
export function useUnit(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.UNIT(id),
    queryFn: () => fetchUnit(id),
    enabled: !!id,
  })
}

// Create unit mutation
export function useCreateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUnitAPI,
    onSuccess: (newUnit) => {
      // Update units list
      queryClient.setQueryData(QUERY_KEYS.UNITS, (old: Unit[] = []) => [
        ...old,
        newUnit,
      ])
      // Set the new unit in cache
      queryClient.setQueryData(QUERY_KEYS.UNIT(newUnit.id), newUnit)
    },
    onError: (error) => {
      console.error("Failed to create unit:", error)
    },
  })
}

// Update unit mutation
export function useUpdateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Unit> }) =>
      updateUnitAPI(id, updates),
    onSuccess: (updatedUnit) => {
      if (updatedUnit) {
        // Update units list
        queryClient.setQueryData(QUERY_KEYS.UNITS, (old: Unit[] = []) =>
          old.map((unit) => (unit.id === updatedUnit.id ? updatedUnit : unit))
        )
        // Update single unit cache
        queryClient.setQueryData(QUERY_KEYS.UNIT(updatedUnit.id), updatedUnit)
      }
    },
    onError: (error) => {
      console.error("Failed to update unit:", error)
    },
  })
}

// Delete unit mutation
export function useDeleteUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUnitAPI,
    onSuccess: (success, deletedId) => {
      if (success) {
        // Remove from units list
        queryClient.setQueryData(QUERY_KEYS.UNITS, (old: Unit[] = []) =>
          old.filter((unit) => unit.id !== deletedId)
        )
        // Remove single unit from cache
        queryClient.removeQueries({ queryKey: QUERY_KEYS.UNIT(deletedId) })
      }
    },
    onError: (error) => {
      console.error("Failed to delete unit:", error)
    },
  })
}

// Optimistic update helper
export function useOptimisticUpdateUnit() {
  const queryClient = useQueryClient()

  return {
    updateUnit: (id: string, updates: Partial<Unit>) => {
      // Optimistically update the cache
      queryClient.setQueryData(QUERY_KEYS.UNIT(id), (old: Unit | null) =>
        old ? { ...old, ...updates } : null
      )
      queryClient.setQueryData(QUERY_KEYS.UNITS, (old: Unit[] = []) =>
        old.map((unit) => (unit.id === id ? { ...unit, ...updates } : unit))
      )
    },
    revertUnit: (id: string) => {
      // Revert changes by refetching
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNIT(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNITS })
    },
  }
}
