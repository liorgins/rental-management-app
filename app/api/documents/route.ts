import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

import { createDocument, getDocuments, initializeData } from "@/lib/kv-service"
import type { Document, DocumentType } from "@/lib/types"

// GET /api/documents - Get all documents
export async function GET(request: Request) {
  try {
    // Initialize data on first load
    await initializeData()

    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get("unitId")
    const type = searchParams.get("type")
    const tags = searchParams.get("tags")
    const scope = searchParams.get("scope")

    let documents = await getDocuments()

    // Filter by unit if specified
    if (unitId) {
      documents = documents.filter((doc) => doc.unitId === unitId)
    }

    // Filter by scope if specified
    if (scope) {
      documents = documents.filter((doc) => doc.scope === scope)
    }

    // Filter by type if specified
    if (type) {
      documents = documents.filter((doc) => doc.type === type)
    }

    // Filter by tags if specified (comma-separated)
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase())
      documents = documents.filter(
        (doc) =>
          doc.tags &&
          doc.tags.some((tag) => tagArray.includes(tag.toLowerCase()))
      )
    }

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Failed to fetch documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

// POST /api/documents - Create a new document
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const scope = formData.get("scope") as string
    const unitId = formData.get("unitId") as string | null
    const description = formData.get("description") as string | null
    const tagsString = formData.get("tags") as string | null

    if (!file || !name || !type || !scope) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate scope and unitId relationship
    if (scope === "Unit" && !unitId) {
      return NextResponse.json(
        { error: "Unit ID is required when scope is Unit" },
        { status: 400 }
      )
    }

    // Parse tags from comma-separated string
    const tags = tagsString
      ? tagsString
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : []

    // Upload file to Vercel Blob
    const documentId = `doc-${crypto.randomUUID()}`
    const filename = `${documentId}-${file.name}`

    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    })

    const document: Document = {
      id: documentId,
      name,
      originalName: file.name,
      type: type as DocumentType,
      mimeType: file.type,
      size: file.size,
      uploadDate: new Date().toISOString(),
      scope: scope as "Global" | "Unit",
      unitId: scope === "Unit" ? unitId || undefined : undefined,
      fileUrl: blob.url, // Direct Vercel Blob URL
      blobKey: filename, // Store the blob key for deletion
      description: description || undefined,
      tags, // Include the parsed tags
    }

    const createdDocument = await createDocument(document)
    return NextResponse.json(createdDocument)
  } catch (error) {
    console.error("Failed to create document:", error)
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}
