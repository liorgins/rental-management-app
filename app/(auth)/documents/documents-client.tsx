"use client"

import { IconFilter, IconSearch, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { toast } from "sonner"

import { DocumentForm } from "@/components/document-form"
import { DocumentsTable } from "@/components/documents-table"
import { Button } from "@/components/ui/button"
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
import {
  useCreateDocument,
  useDocumentTags,
  useFilteredDocuments,
} from "@/hooks/use-documents"
import { useUnits } from "@/hooks/use-units"

export function DocumentsClient() {
  const { data: units = [] } = useUnits()
  const { data: tagData } = useDocumentTags()
  const allTags = tagData?.tags || []

  // Filter states
  const [filters, setFilters] = useState<{
    type?: string
    scope?: string
    tags?: string[]
    unitId?: string
    search?: string
  }>({})

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Apply filters
  const effectiveFilters = {
    ...filters,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
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

  const clearFilters = () => {
    setFilters({})
    setSelectedTags([])
    setSearchTerm("")
  }

  const activeFiltersCount =
    Object.values(effectiveFilters).filter(
      (value) => value !== undefined && value !== ""
    ).length + (searchTerm ? 1 : 0)

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
      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <IconFilter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto h-8"
            >
              <IconX className="h-4 w-4" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

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
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Documents</SheetTitle>
                <SheetDescription>
                  Use the filters below to find specific documents
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4">
                {/* Document Type */}
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select
                    value={filters.type || "all"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        type: value === "all" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Tax">Tax</SelectItem>
                      <SelectItem value="Invoice">Invoice</SelectItem>
                      <SelectItem value="Receipt">Receipt</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Scope */}
                <div className="space-y-2">
                  <Label>Scope</Label>
                  <Select
                    value={filters.scope || "all"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        scope: value === "all" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All scopes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All scopes</SelectItem>
                      <SelectItem value="Global">Global</SelectItem>
                      <SelectItem value="Unit">Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit Filter */}
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select
                    value={filters.unitId || "all"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        unitId: value === "all" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All units</SelectItem>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Filter */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    {allTags.map((tag) => (
                      <label key={tag} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags((prev) => [...prev, tag])
                            } else {
                              setSelectedTags((prev) =>
                                prev.filter((t) => t !== tag)
                              )
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{tag}</span>
                      </label>
                    ))}
                    {allTags.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No tags available yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Documents Table */}
      <DocumentsTable
        documents={filteredDocuments}
        units={units}
        isLoading={isLoading}
      />

      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredDocuments.length} of {documents.length} documents
        {activeFiltersCount > 0 &&
          ` (${activeFiltersCount} filter${
            activeFiltersCount > 1 ? "s" : ""
          } applied)`}
      </div>
    </div>
  )
}
