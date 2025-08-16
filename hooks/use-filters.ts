import type { ActiveFilter } from "@/components/filter-section"
import { useMemo, useState } from "react"

export interface UseFiltersProps {
  // Helper function to get display names for values
  getDisplayValue?: (key: string, value: string) => string
}

export function useFilters({ getDisplayValue }: UseFiltersProps = {}) {
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [checkboxSelections, setCheckboxSelections] = useState<
    Record<string, string[]>
  >({})

  // Update a single filter
  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Update checkbox selections
  const updateCheckboxSelection = (key: string, values: string[]) => {
    setCheckboxSelections((prev) => ({
      ...prev,
      [key]: values,
    }))
  }

  // Remove a specific filter
  const removeFilter = (key: string, value?: string) => {
    if (key === "search") {
      setSearchTerm("")
    } else if (value && checkboxSelections[key]) {
      // Handle checkbox filter removal
      updateCheckboxSelection(
        key,
        checkboxSelections[key].filter((v) => v !== value)
      )
    } else {
      // Handle regular filter removal
      setFilters((prev) => ({
        ...prev,
        [key]: undefined,
      }))
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({})
    setSearchTerm("")
    setCheckboxSelections({})
  }

  // Generate active filters for display
  const activeFilters = useMemo((): ActiveFilter[] => {
    const result: ActiveFilter[] = []

    // Add search term
    if (searchTerm) {
      result.push({
        key: "search",
        label: "Search",
        value: searchTerm,
        displayValue: `"${searchTerm}"`,
      })
    }

    // Add regular filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        const displayValue = getDisplayValue
          ? getDisplayValue(key, value)
          : value
        result.push({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value,
          displayValue,
        })
      }
    })

    // Add checkbox selections
    Object.entries(checkboxSelections).forEach(([key, values]) => {
      values.forEach((value) => {
        const displayValue = getDisplayValue
          ? getDisplayValue(key, value)
          : value
        result.push({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value: values,
          displayValue,
        })
      })
    })

    return result
  }, [filters, searchTerm, checkboxSelections, getDisplayValue])

  // Get effective filters (non-undefined values)
  const effectiveFilters = useMemo(() => {
    const result = { ...filters }

    // Add checkbox selections to effective filters
    Object.entries(checkboxSelections).forEach(([key, values]) => {
      if (values.length > 0) {
        result[key] = values
      }
    })

    // Remove undefined values
    Object.keys(result).forEach((key) => {
      if (result[key] === undefined || result[key] === null) {
        delete result[key]
      }
    })

    return result
  }, [filters, checkboxSelections])

  return {
    // State
    filters,
    searchTerm,
    checkboxSelections,
    activeFilters,
    effectiveFilters,

    // Actions
    updateFilter,
    updateCheckboxSelection,
    setSearchTerm,
    removeFilter,
    clearAllFilters,
  }
}
