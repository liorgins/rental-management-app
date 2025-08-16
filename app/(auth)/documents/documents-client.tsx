"use client"

import { toast } from "sonner"

import { DocumentForm } from "@/components/document-form"
import { DocumentsTable } from "@/components/documents-table"
import { FilterSection, type FilterGroup } from "@/components/filter-section"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useCreateDocument,
  useDocumentTags,
  useFilteredDocuments,
} from "@/hooks/use-documents"
import { useFilters } from "@/hooks/use-filters"
import { useUnits } from "@/hooks/use-units"

export function DocumentsClient() {
  const { data: units = [] } = useUnits()
  const { data: tagData } = useDocumentTags()
  const allTags = tagData?.tags || []

  // Filter management
  const {
    filters,
    searchTerm,
    activeFilters,
    checkboxSelections,
    updateFilter,
    updateCheckboxSelection,
    setSearchTerm,
    removeFilter,
    clearAllFilters,
  } = useFilters({
    getDisplayValue: (key, value) => {
      if (key === "unitId") {
        const unit = units.find((u) => u.id === value)
        return unit?.name || "Unknown Unit"
      }
      return value
    },
  })

  // Apply filters
  const effectiveFilters = {
    ...filters,
    tags:
      checkboxSelections.tags?.length > 0 ? checkboxSelections.tags : undefined,
  }

  const { data: documents = [], isLoading } =
    useFilteredDocuments(effectiveFilters)
  const createDocumentMutation = useCreateDocument()

  // Filter documents by search term on the client side
  const filteredDocuments = documents.filter((doc) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      doc.name.toLowerCase().includes(searchLower) ||
      doc.description?.toLowerCase().includes(searchLower) ||
      doc.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    )
  })

  const handleCreateDocument = async (formData: FormData) => {
    try {
      await createDocumentMutation.mutateAsync(formData)
      toast.success("Document uploaded successfully!")
    } catch (error) {
      console.error("Failed to create document:", error)
      toast.error("Failed to upload document")
    }
  }

  // Filter configuration
  const filterGroups: FilterGroup[] = [
    {
      title: "Basic Filters",
      fields: [
        {
          key: "type",
          label: "Document Type",
          type: "select",
          options: [
            { value: "Contract", label: "Contract" },
            { value: "Insurance", label: "Insurance" },
            { value: "Maintenance", label: "Maintenance" },
            { value: "Tax", label: "Tax" },
            { value: "Invoice", label: "Invoice" },
            { value: "Receipt", label: "Receipt" },
            { value: "Other", label: "Other" },
          ],
        },
        {
          key: "scope",
          label: "Scope",
          type: "select",
          options: [
            { value: "Global", label: "Global" },
            { value: "Unit", label: "Unit" },
          ],
        },
        {
          key: "unitId",
          label: "Unit",
          type: "select",
          options: units.map((unit) => ({
            value: unit.id,
            label: unit.name,
          })),
        },
      ],
    },
  ]

  const checkboxFilters = [
    {
      key: "tags",
      label: "Tags",
      options: allTags,
      selectedValues: checkboxSelections.tags || [],
      onSelectionChange: (values: string[]) =>
        updateCheckboxSelection("tags", values),
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Manage all your rental property documents
          </p>
        </div>
        <DocumentForm
          units={units}
          onUpload={handleCreateDocument}
          isUploading={createDocumentMutation.isPending}
        />
      </div>

      {/* Filters */}
      <FilterSection
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search documents..."
        filterGroups={filterGroups}
        filters={filters}
        onFilterChange={updateFilter}
        checkboxFilters={checkboxFilters}
        activeFilters={activeFilters}
        onRemoveFilter={removeFilter}
        onClearAllFilters={clearAllFilters}
      />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total Documents
          </div>
          <div className="text-2xl font-bold">{filteredDocuments.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total Files
          </div>
          <div className="text-2xl font-bold">{documents.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Active Filters
          </div>
          <div className="text-2xl font-bold">{activeFilters.length}</div>
        </div>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <DocumentsTable
            documents={filteredDocuments}
            units={units}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredDocuments.length} of {documents.length} documents
        {activeFilters.length > 0 &&
          ` (${activeFilters.length} filter${
            activeFilters.length > 1 ? "s" : ""
          } applied)`}
      </div>
    </div>
  )
}
