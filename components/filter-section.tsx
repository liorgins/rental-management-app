"use client"

import { IconFilter, IconSearch, IconX } from "@tabler/icons-react"
import { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Base filter interfaces
export interface FilterOption {
  value: string
  label: string
}

export interface FilterField {
  key: string
  label: string
  type: "select" | "multiselect" | "checkbox"
  options?: FilterOption[]
  placeholder?: string
}

export interface FilterGroup {
  title: string
  fields: FilterField[]
}

export interface ActiveFilter {
  key: string
  label: string
  value: string | string[]
  displayValue: string
}

export interface FilterSectionProps {
  // Search functionality
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string

  // Filter groups for the drawer
  filterGroups: FilterGroup[]

  // Current filter values
  filters: Record<string, string | number | boolean | undefined>
  onFilterChange: (
    key: string,
    value: string | number | boolean | undefined
  ) => void

  checkboxFilters?: {
    key: string
    label: string
    options: string[]
    selectedValues: string[]
    onSelectionChange: (values: string[]) => void
  }[]
  activeFilters: ActiveFilter[]
  onRemoveFilter: (key: string, value?: string) => void
  onClearAllFilters: () => void
  customContent?: ReactNode //
  className?: string
}

export function FilterSection({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterGroups,
  filters,
  onFilterChange,
  checkboxFilters = [],
  activeFilters,
  onRemoveFilter,
  onClearAllFilters,
  customContent,
  className = "",
}: FilterSectionProps) {
  const activeFiltersCount = activeFilters.length

  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border bg-card p-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <IconFilter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters</span>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="ml-auto h-8"
          >
            <IconX className="h-4 w-4" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={`${filter.key}-${filter.displayValue}-${index}`}
              variant="outline"
              className="gap-1"
            >
              {filter.label}: {filter.displayValue}
              <button
                onClick={() =>
                  onRemoveFilter(
                    filter.key,
                    Array.isArray(filter.value)
                      ? filter.displayValue
                      : undefined
                  )
                }
                className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Custom Content */}
        {customContent}

        {/* Advanced Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <IconFilter className="h-4 w-4" />
              More Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="p-4">
            <SheetHeader className="pb-4">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Use the filters below to refine your search
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 pb-4">
              {/* Filter Groups */}
              {filterGroups.map((group) => (
                <Card key={group.title}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{group.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {group.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label>{field.label}</Label>
                        <Select
                          value={filters[field.key]?.toString() || "all"}
                          onValueChange={(value) =>
                            onFilterChange(
                              field.key,
                              value === "all" ? undefined : value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                field.placeholder ||
                                `All ${field.label.toLowerCase()}`
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              All {field.label}
                            </SelectItem>
                            {field.options?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {/* Checkbox Filters */}
              {checkboxFilters.map((checkboxFilter) => (
                <Card key={checkboxFilter.key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {checkboxFilter.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {checkboxFilter.options.map((option) => (
                        <div
                          key={option}
                          className="flex items-center space-x-3"
                        >
                          <Checkbox
                            id={`${checkboxFilter.key}-${option}`}
                            checked={checkboxFilter.selectedValues.includes(
                              option
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                checkboxFilter.onSelectionChange([
                                  ...checkboxFilter.selectedValues,
                                  option,
                                ])
                              } else {
                                checkboxFilter.onSelectionChange(
                                  checkboxFilter.selectedValues.filter(
                                    (v) => v !== option
                                  )
                                )
                              }
                            }}
                          />
                          <Label
                            htmlFor={`${checkboxFilter.key}-${option}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                      {checkboxFilter.options.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No {checkboxFilter.label.toLowerCase()} available yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      variant="outline"
                      onClick={onClearAllFilters}
                      className="w-full"
                    >
                      Clear All Filters ({activeFiltersCount})
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
