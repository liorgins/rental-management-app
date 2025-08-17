"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconDownload, IconEdit, IconEye, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TagsInput } from "@/components/ui/tags-input"
import { Textarea } from "@/components/ui/textarea"
import { TruncatedText } from "@/components/ui/truncated-text"
import {
  useDeleteDocument,
  useDocumentTags,
  useUpdateDocument,
} from "@/hooks/use-documents"
import type { Document, Unit } from "@/lib/types"

// Validation schema for edit form
const editDocumentSchema = z
  .object({
    name: z.string().min(1, "Document name is required"),
    type: z.enum([
      "Contract",
      "Insurance",
      "Maintenance",
      "Tax",
      "Invoice",
      "Receipt",
      "Other",
    ] as const),
    scope: z.enum(["Global", "Unit"] as const),
    unitId: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // If scope is "Unit", unitId is required
      if (data.scope === "Unit" && !data.unitId) {
        return false
      }
      return true
    },
    {
      message: "Unit is required when scope is Unit",
      path: ["unitId"],
    }
  )

type EditDocumentFormData = z.infer<typeof editDocumentSchema>

type Props = {
  documents: Document[]
  units: Unit[]
  isLoading?: boolean
}

export function DocumentsTable({ documents, units, isLoading }: Props) {
  const updateDocumentMutation = useUpdateDocument()
  const deleteDocumentMutation = useDeleteDocument()
  const { data: tagData } = useDocumentTags()
  const allTags = tagData?.tags || []

  // Edit modal states
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)

  // Delete confirmation states
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(
    null
  )

  // Set up React Hook Form for editing
  const editForm = useForm<EditDocumentFormData>({
    resolver: zodResolver(editDocumentSchema),
    defaultValues: {
      name: "",
      type: "Contract",
      scope: "Global",
      unitId: undefined,
      description: "",
      tags: [],
    },
  })

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    watch: editWatch,
    reset: editReset,
    formState: { errors: editErrors },
  } = editForm
  const editScopeValue = editWatch("scope")

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document)
    // Pre-populate the form with document data
    editReset({
      name: document.name,
      type: document.type,
      scope: document.scope,
      unitId: document.unitId,
      description: document.description || "",
      tags: document.tags || [],
    })
  }

  const onEditSubmit = async (data: EditDocumentFormData) => {
    if (!editingDocument) return

    try {
      await updateDocumentMutation.mutateAsync({
        id: editingDocument.id,
        updates: data,
      })
      toast.success("Document updated successfully")
      setEditingDocument(null)
      editReset()
    } catch (error) {
      toast.error("Failed to update document")
      console.error(error)
    }
  }

  const handleDeleteDocument = async (document: Document) => {
    setDeletingDocument(document)
  }

  const confirmDeleteDocument = async () => {
    if (!deletingDocument) return

    try {
      await deleteDocumentMutation.mutateAsync(deletingDocument.id)
      toast.success("Document deleted successfully")
      setDeletingDocument(null)
    } catch (error) {
      toast.error("Failed to delete document")
      console.error(error)
    }
  }

  const getUnitName = (unitId?: string) => {
    if (!unitId) return "N/A"
    const unit = units.find((u) => u.id === unitId)
    return unit?.name || "Unknown Unit"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleViewDocument = (doc: Document) => {
    // Open the direct blob URL in a new tab
    window.open(doc.fileUrl, "_blank")
  }

  const handleDownloadDocument = (doc: Document) => {
    // Use Vercel Blob's built-in download parameter for forced download
    const downloadUrl = `${doc.fileUrl}?download=1`

    // Create download link
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = doc.originalName
    link.style.display = "none"

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        Loading documents...
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    <TruncatedText text={document.name} maxWidth="200px" />
                  </TableCell>
                  <TableCell>{document.type}</TableCell>
                  <TableCell>{formatFileSize(document.size)}</TableCell>
                  <TableCell>{formatDate(document.uploadDate)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        document.scope === "Global"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-emerald-800"
                      }`}
                    >
                      {document.scope}
                    </span>
                  </TableCell>
                  <TableCell>{getUnitName(document.unitId)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {document.tags && document.tags.length > 0
                        ? document.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <TruncatedText
                      text={document.description || "-"}
                      maxWidth="200px"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewDocument(document)}
                        title="View document"
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDownloadDocument(document)}
                        title="Download document"
                      >
                        <IconDownload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditDocument(document)}
                        title="Edit document"
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteDocument(document)}
                        title="Delete document"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Document Dialog */}
      <Dialog
        open={!!editingDocument}
        onOpenChange={(open) => !open && setEditingDocument(null)}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update the document details below.
            </DialogDescription>
          </DialogHeader>
          {editingDocument && (
            <form
              className="grid gap-4"
              onSubmit={handleEditSubmit(onEditSubmit)}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-name">Document Name</Label>
                  <Controller
                    name="name"
                    control={editControl}
                    render={({ field }) => <Input id="edit-name" {...field} />}
                  />
                  {editErrors.name && (
                    <span className="text-red-500">
                      {editErrors.name.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Document Type</Label>
                  <Controller
                    name="type"
                    control={editControl}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Insurance">Insurance</SelectItem>
                          <SelectItem value="Maintenance">
                            Maintenance
                          </SelectItem>
                          <SelectItem value="Tax">Tax</SelectItem>
                          <SelectItem value="Invoice">Invoice</SelectItem>
                          <SelectItem value="Receipt">Receipt</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {editErrors.type && (
                    <span className="text-red-500">
                      {editErrors.type.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Scope</Label>
                  <Controller
                    name="scope"
                    control={editControl}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Global or Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Global">Global</SelectItem>
                          <SelectItem value="Unit">Unit</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {editErrors.scope && (
                    <span className="text-red-500">
                      {editErrors.scope.message}
                    </span>
                  )}
                </div>
                {editScopeValue === "Unit" && (
                  <div className="flex flex-col gap-2">
                    <Label>Unit</Label>
                    <Controller
                      name="unitId"
                      control={editControl}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {editErrors.unitId && (
                      <span className="text-red-500">
                        {editErrors.unitId.message}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <Controller
                  name="tags"
                  control={editControl}
                  render={({ field }) => (
                    <TagsInput
                      value={field.value || []}
                      onChange={field.onChange}
                      suggestions={allTags}
                      placeholder="Add tags (press Enter or comma to add)"
                      maxTags={10}
                    />
                  )}
                />
                {editErrors.tags && (
                  <span className="text-red-500">
                    {editErrors.tags.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Controller
                  name="description"
                  control={editControl}
                  render={({ field }) => (
                    <Textarea id="edit-description" {...field} />
                  )}
                />
                {editErrors.description && (
                  <span className="text-red-500">
                    {editErrors.description.message}
                  </span>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingDocument(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateDocumentMutation.isPending}
                >
                  {updateDocumentMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingDocument}
        onOpenChange={(open) => !open && setDeletingDocument(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deletingDocument?.name}
              &rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingDocument(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDocument}
              disabled={deleteDocumentMutation.isPending}
            >
              {deleteDocumentMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
