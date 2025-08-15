import { NextResponse } from "next/server"

import { getDocument } from "@/lib/kv-service"

// GET /api/documents/[id]/download - Download or view a document
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const document = await getDocument(id)

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Get query parameters to determine if it's a download or view
    const { searchParams } = new URL(request.url)
    const download = searchParams.get("download") === "true"

    // For Vercel Blob URLs, we can just redirect to the blob URL
    // The blob URL already handles the file serving
    const url = new URL(document.fileUrl)

    if (download) {
      // Add download parameter to force download
      url.searchParams.set("download", "1")
    }

    // Redirect to the blob URL which will serve the file directly
    return NextResponse.redirect(url.toString())
  } catch (error) {
    console.error("Failed to download document:", error)
    return NextResponse.json(
      { error: "Failed to download document" },
      { status: 500 }
    )
  }
}
