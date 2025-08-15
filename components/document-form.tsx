"use client"

import { IconPlus } from "@tabler/icons-react"
import * as React from "react"

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
import type { DocumentType, Unit } from "@/lib/types"

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
  const [scope, setScope] = React.useState<"Global" | "Unit">(
    defaultUnitId ? "Unit" : "Global"
  )
  const [type, setType] = React.useState<DocumentType>("Contract")
  const [name, setName] = React.useState("")
  const [unitId, setUnitId] = React.useState<string | undefined>(defaultUnitId)
  const [description, setDescription] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [file, setFile] = React.useState<File | null>(null)

  const { data: tagData } = useDocumentTags()
  const allTags = tagData?.tags || []

  React.useEffect(() => {
    if (defaultUnitId) {
      setScope("Unit")
      setUnitId(defaultUnitId)
    }
  }, [defaultUnitId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !name) return
    if (scope === "Unit" && !unitId) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("name", name)
    formData.append("type", type)
    formData.append("scope", scope)
    if (scope === "Unit" && unitId) {
      formData.append("unitId", unitId)
    }
    if (description) {
      formData.append("description", description)
    }
    if (tags.length > 0) {
      formData.append("tags", tags.join(","))
    }

    onUpload(formData).then(() => {
      setOpen(false)
      // Reset form
      setName("")
      setDescription("")
      setTags([])
      setFile(null)
      setType("Contract")
      if (!defaultUnitId) setScope("Global")
    })
  }

  function handleFilesChange(files: File[]) {
    const selectedFile = files[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Auto-fill name with filename if not already set
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, "")) // Remove extension
      }
    } else {
      setFile(null)
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
        <form className="grid gap-4" onSubmit={handleSubmit}>
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
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Document Name</Label>
              <Input
                id="name"
                placeholder="e.g., Lease Agreement"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Document Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as DocumentType)}
              >
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
            </div>
            <div className="flex flex-col gap-2">
              <Label>Scope</Label>
              <Select
                value={scope}
                onValueChange={(v) => setScope(v as "Global" | "Unit")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Global or Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="Unit">Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {scope === "Unit" && (
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Unit</Label>
                <Select value={unitId} onValueChange={(v) => setUnitId(v)}>
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
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <TagsInput
              value={tags}
              onChange={setTags}
              suggestions={allTags}
              placeholder="Add tags (press Enter or comma to add)"
              maxTags={10}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional notes about this document"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!file || !name || isUploading}>
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
