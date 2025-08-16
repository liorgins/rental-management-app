"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconPlus } from "@tabler/icons-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileUpload } from "@/components/ui/file-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TagsInput } from "@/components/ui/tags-input"
import { Textarea } from "@/components/ui/textarea"
import { useDocumentTags } from "@/hooks/use-documents"
import type { Unit } from "@/lib/types"

// Validation schema
const documentFormSchema = z
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
    file: z.instanceof(File, { message: "File is required" }),
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

type DocumentFormData = z.infer<typeof documentFormSchema>

type Props = {
  units: Unit[]
  defaultUnitId?: string
  onUpload: (formData: FormData) => Promise<void>
  isUploading?: boolean
}

export function DocumentForm({
  units,
  defaultUnitId,
  onUpload,
  isUploading = false,
}: Props) {
  const [open, setOpen] = React.useState(false)

  const { data: tagData } = useDocumentTags()
  const allTags = tagData?.tags || []

  // Set up React Hook Form with default values
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      type: "Contract",
      scope: defaultUnitId ? "Unit" : "Global",
      unitId: defaultUnitId,
      description: "",
      tags: [],
      file: undefined as unknown as File, // File will be set via setValue
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = form
  const scopeValue = watch("scope")

  // Handle default unit
  React.useEffect(() => {
    if (defaultUnitId) {
      setValue("scope", "Unit")
      setValue("unitId", defaultUnitId)
    }
  }, [defaultUnitId, setValue])

  const onSubmit = async (data: DocumentFormData) => {
    const formData = new FormData()
    formData.append("file", data.file)
    formData.append("name", data.name)
    formData.append("type", data.type)
    formData.append("scope", data.scope)
    if (data.scope === "Unit" && data.unitId) {
      formData.append("unitId", data.unitId)
    }
    if (data.description) {
      formData.append("description", data.description)
    }
    if (data.tags && data.tags.length > 0) {
      formData.append("tags", data.tags.join(","))
    }

    try {
      await onUpload(formData)
      setOpen(false)
      // Reset form
      reset({
        name: "",
        type: "Contract",
        scope: defaultUnitId ? "Unit" : "Global",
        unitId: defaultUnitId,
        description: "",
        tags: [],
        file: undefined as unknown as File,
      })
    } catch (error) {
      // Handle error if needed
      console.error("Upload failed:", error)
    }
  }

  function handleFilesChange(files: File[]) {
    const selectedFile = files[0]
    if (selectedFile) {
      setValue("file", selectedFile)
      // Auto-fill name with filename if not already set
      const currentName = watch("name")
      if (!currentName) {
        setValue("name", selectedFile.name.replace(/\.[^/.]+$/, "")) // Remove extension
      }
    } else {
      setValue("file", undefined as unknown as File)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <IconPlus />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document and associate it with a unit or mark it as global.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>File</Label>
              <FileUpload
                single={true}
                maxSize={50} // 50MB limit for documents
                acceptedTypes={[
                  "application/pdf",
                  ".doc",
                  ".docx",
                  ".txt",
                  ".jpg",
                  ".jpeg",
                  ".png",
                ]}
                onFilesChange={handleFilesChange}
              />
              {errors.file && (
                <span className="text-xs text-red-500">
                  {errors.file.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Document Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="name"
                    placeholder="e.g., Lease Agreement"
                    {...field}
                  />
                )}
              />
              {errors.name && (
                <span className="text-xs text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Document Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Tax">Tax</SelectItem>
                      <SelectItem value="Invoice">Invoice</SelectItem>
                      <SelectItem value="Receipt">Receipt</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <span className="text-xs text-red-500">
                  {errors.type.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Scope</Label>
              <Controller
                name="scope"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
              {errors.scope && (
                <span className="text-xs text-red-500">
                  {errors.scope.message}
                </span>
              )}
            </div>
            {scopeValue === "Unit" && (
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Unit</Label>
                <Controller
                  name="unitId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                {errors.unitId && (
                  <span className="text-xs text-red-500">
                    {errors.unitId.message}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Controller
              name="tags"
              control={control}
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
            {errors.tags && (
              <span className="text-xs text-red-500">
                {errors.tags.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Additional notes about this document"
                  {...field}
                />
              )}
            />
            {errors.description && (
              <span className="text-xs text-red-500">
                {errors.description.message}
              </span>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
