import { del } from "@vercel/blob"
import { NextResponse } from "next/server"

import { deleteDocument, getDocument, updateDocument } from "@/lib/kv-service"

// GET /api/documents/[id] - Get a specific document
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const document = await getDocument(id)

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error("Failed to fetch document:", error)
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    )
  }
}

// PUT /api/documents/[id] - Update a specific document
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updatedDocument = await updateDocument(id, body)

    if (!updatedDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error("Failed to update document:", error)
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id] - Delete a specific document
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the document first to get the blob URL
    const document = await getDocument(id)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Delete from Vercel Blob storage first
    try {
      // Use the blobKey if available, otherwise extract from URL
      const keyToDelete = document.blobKey || document.fileUrl
      await del(keyToDelete, {
        token: process.env.BLOB_READ_WRITE_TOKEN!,
      })
    } catch (blobError) {
      console.warn("Failed to delete from blob storage:", blobError)
      // Continue with document deletion even if blob deletion fails
    }

    // Delete from database
    const success = await deleteDocument(id)
    if (!success) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete document:", error)
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    )
  }
}
