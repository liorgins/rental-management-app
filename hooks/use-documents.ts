import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Document } from "@/lib/types"

// API functions
async function fetchDocuments(params?: {
  unitId?: string
  type?: string
  tags?: string
  scope?: string
}): Promise<Document[]> {
  const searchParams = new URLSearchParams()
  if (params?.unitId) searchParams.set("unitId", params.unitId)
  if (params?.type) searchParams.set("type", params.type)
  if (params?.tags) searchParams.set("tags", params.tags)
  if (params?.scope) searchParams.set("scope", params.scope)

  const url = `/api/documents${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch documents")
  }
  return response.json()
}

async function fetchDocumentTags(): Promise<{ tags: string[] }> {
  const response = await fetch("/api/documents/tags")
  if (!response.ok) {
    throw new Error("Failed to fetch document tags")
  }
  return response.json()
}

async function fetchDocument(id: string): Promise<Document | null> {
  const response = await fetch(`/api/documents/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error("Failed to fetch document")
  }
  return response.json()
}

async function createDocumentAPI(formData: FormData): Promise<Document> {
  const response = await fetch("/api/documents", {
    method: "POST",
    body: formData,
  })
  if (!response.ok) {
    throw new Error("Failed to create document")
  }
  return response.json()
}

async function updateDocumentAPI(
  id: string,
  updates: Partial<Document>
): Promise<Document | null> {
  const response = await fetch(`/api/documents/${id}`, {
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
    throw new Error("Failed to update document")
  }
  return response.json()
}

async function deleteDocumentAPI(id: string): Promise<boolean> {
  const response = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    if (response.status === 404) {
      return false
    }
    throw new Error("Failed to delete document")
  }
  const result = await response.json()
  return result.success
}

// Query keys
export const QUERY_KEYS = {
  DOCUMENTS: ["documents"] as const,
  DOCUMENT: (id: string) => ["documents", id] as const,
  UNIT_DOCUMENTS: (unitId: string) => ["documents", "unit", unitId] as const,
  DOCUMENT_TAGS: ["documents", "tags"] as const,
}

// Get all documents
export function useDocuments() {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS,
    queryFn: () => fetchDocuments(),
  })
}

// Get single document
export function useDocument(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENT(id),
    queryFn: () => fetchDocument(id),
    enabled: !!id,
  })
}

// Get documents for a specific unit
export function useUnitDocuments(unitId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.UNIT_DOCUMENTS(unitId),
    queryFn: () => fetchDocuments({ unitId }),
    enabled: !!unitId,
  })
}

// Get global documents
export function useGlobalDocuments() {
  return useQuery({
    queryKey: ["documents", "global"],
    queryFn: () => fetchDocuments({ unitId: "global" }),
  })
}

// Create document mutation
export function useCreateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDocumentAPI,
    onSuccess: (newDocument) => {
      // Invalidate all documents-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS })
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT_TAGS })

      // Set the new document in cache
      queryClient.setQueryData(QUERY_KEYS.DOCUMENT(newDocument.id), newDocument)
    },
    onError: (error) => {
      console.error("Failed to create document:", error)
    },
  })
}

// Update document mutation
export function useUpdateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Document> }) =>
      updateDocumentAPI(id, updates),
    onSuccess: (updatedDocument) => {
      if (updatedDocument) {
        // Invalidate all documents-related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS })
        queryClient.invalidateQueries({ queryKey: ["documents"] })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT_TAGS })

        // Update single document cache
        queryClient.setQueryData(
          QUERY_KEYS.DOCUMENT(updatedDocument.id),
          updatedDocument
        )
      }
    },
    onError: (error) => {
      console.error("Failed to update document:", error)
    },
  })
}

// Delete document mutation
export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDocumentAPI,
    onSuccess: (success, deletedId) => {
      if (success) {
        // Invalidate all documents-related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS })
        queryClient.invalidateQueries({ queryKey: ["documents"] })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT_TAGS })

        // Remove single document from cache
        queryClient.removeQueries({ queryKey: QUERY_KEYS.DOCUMENT(deletedId) })
      }
    },
    onError: (error) => {
      console.error("Failed to delete document:", error)
    },
  })
}

// Get all unique document tags
export function useDocumentTags() {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENT_TAGS,
    queryFn: fetchDocumentTags,
  })
}

// Get filtered documents with advanced filtering
export function useFilteredDocuments(filters?: {
  unitId?: string
  type?: string
  tags?: string[]
  scope?: string
}) {
  const tagsString = filters?.tags?.join(",") || undefined

  return useQuery({
    queryKey: ["documents", "filtered", filters],
    queryFn: () =>
      fetchDocuments({
        unitId: filters?.unitId,
        type: filters?.type,
        tags: tagsString,
        scope: filters?.scope,
      }),
  })
}

// Note: With Vercel Blob, documents now have direct URLs stored in fileUrl
// No need for custom download/view URLs as blob URLs handle this directly
