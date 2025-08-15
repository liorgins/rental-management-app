import { NextResponse } from "next/server"

import { getDocuments } from "@/lib/kv-service"

// GET /api/documents/tags - Get all unique tags from documents
export async function GET() {
  try {
    const documents = await getDocuments()

    // Extract all tags from all documents
    const allTags = documents.flatMap((doc) => doc.tags || [])

    // Get unique tags (case-sensitive, but dedupe case-insensitively) and sort them
    const tagMap = new Map<string, string>()
    allTags.forEach((tag) => {
      const lowerTag = tag.toLowerCase()
      if (!tagMap.has(lowerTag)) {
        tagMap.set(lowerTag, tag) // Store the first occurrence with original case
      }
    })
    const uniqueTags = Array.from(tagMap.values()).sort()

    return NextResponse.json({ tags: uniqueTags })
  } catch (error) {
    console.error("Failed to fetch document tags:", error)
    return NextResponse.json(
      { error: "Failed to fetch document tags" },
      { status: 500 }
    )
  }
}
