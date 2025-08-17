"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  IconFile,
  IconFileText,
  IconPhoto,
  IconUpload,
  IconX,
} from "@tabler/icons-react"
import { useRef, useState, type ChangeEvent, type DragEvent } from "react"

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
  single?: boolean
}

export function FileUpload({
  onFilesChange,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ["image/*", "application/pdf", ".doc", ".docx", ".txt"],
  className = "",
  single = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        console.log(`File ${file.name} is too large`)
        return false
      }
      return true
    })

    let updatedFiles: File[]
    if (single) {
      updatedFiles = validFiles.slice(0, 1) // Only take the first file
    } else {
      updatedFiles = [...files, ...validFiles].slice(0, maxFiles)
    }

    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <IconPhoto className="h-4 w-4" />
    if (file.type === "application/pdf")
      return <IconFileText className="h-4 w-4" />
    return <IconFile className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    )
  }

  const isUploadDisabled = single && files.length > 0

  return (
    <div className={`space-y-4 ${className}`}>
      <Card
        className={`border-2 border-dashed transition-all duration-200 bg-background ${
          isUploadDisabled
            ? "border-muted-foreground/10 opacity-50 cursor-not-allowed"
            : `cursor-pointer ${
                isDragOver
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              }`
        }`}
        onDragOver={!isUploadDisabled ? handleDragOver : undefined}
        onDragLeave={!isUploadDisabled ? handleDragLeave : undefined}
        onDrop={!isUploadDisabled ? handleDrop : undefined}
        onClick={!isUploadDisabled ? openFileDialog : undefined}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div
            className={`rounded-full p-4 mb-4 transition-colors ${
              isUploadDisabled
                ? "bg-muted"
                : isDragOver
                ? "bg-primary/10"
                : "bg-muted"
            }`}
          >
            <IconUpload
              className={`h-8 w-8 transition-colors ${
                isUploadDisabled
                  ? "text-muted-foreground/50"
                  : isDragOver
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isUploadDisabled
                ? "File uploaded"
                : isDragOver
                ? `Drop ${single ? "file" : "files"} here`
                : `Upload ${single ? "file" : "files"}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isUploadDisabled
                ? "Remove the current file to upload a new one"
                : `Drag and drop ${
                    single ? "a file" : "files"
                  } here, or click to browse`}
            </p>
            <p className="text-xs text-muted-foreground">
              {single
                ? `Up to ${maxSize}MB`
                : `Max ${maxFiles} files, up to ${maxSize}MB each`}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple={!single}
            accept={acceptedTypes.join(",")}
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {single
              ? "Uploaded File"
              : `Uploaded Files (${files.length}/${maxFiles})`}
          </h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
