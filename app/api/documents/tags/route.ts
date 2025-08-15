import { NextResponse } from "next/server"

import { getDocuments } from "@/lib/kv-service"

// GET /api/documents/tags - Get all unique tags from documents
export async function GET() {
  try {
    const documents = await getDocuments()

    // Extract all tags from all documents
    const allTags = documents.flatMap((doc) => doc.tags || [])

    // Get unique tags (case-insensitive) and sort them
    const uniqueTags = Array.from(
      new Set(allTags.map((tag) => tag.toLowerCase()))
    ).sort()

    return NextResponse.json({ tags: uniqueTags })
  } catch (error) {
    console.error("Failed to fetch document tags:", error)
    return NextResponse.json(
      { error: "Failed to fetch document tags" },
      { status: 500 }
    )
  }
}
