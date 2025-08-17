import { NextRequest, NextResponse } from "next/server"

export async function PUT(_request: NextRequest) {
  // Simulate a server error for testing optimistic updates rollback
  return NextResponse.json(
    { error: "Simulated server error for testing" },
    { status: 500 }
  )
}
