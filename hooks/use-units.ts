import {
  createUnit,
  deleteUnit,
  getUnit,
  getUnits,
  initializeData,
  updateUnit,
} from "@/lib/kv-service"
import type { Unit } from "@/lib/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Query keys
export const QUERY_KEYS = {
  UNITS: ["units"] as const,
  UNIT: (id: string) => ["units", id] as const,
}

// Get all units
export function useUnits() {
  return useQuery({
    queryKey: QUERY_KEYS.UNITS,
    queryFn: async () => {
      // Initialize data on first load
      await initializeData()
      return getUnits()
    },
  })
}

// Get single unit
export function useUnit(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.UNIT(id),
    queryFn: () => getUnit(id),
    enabled: !!id,
  })
}

// Create unit mutation
export function useCreateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUnit,
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
      updateUnit(id, updates),
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
    mutationFn: deleteUnit,
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


