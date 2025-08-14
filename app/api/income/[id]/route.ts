import { NextResponse } from "next/server"

import { deleteIncome, getIncome, updateIncome } from "@/lib/kv-service"

// GET /api/income/[id] - Get a specific income
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const income = await getIncome(id)

    if (!income) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 })
    }

    return NextResponse.json(income)
  } catch (error) {
    console.error("Failed to fetch income:", error)
    return NextResponse.json(
      { error: "Failed to fetch income" },
      { status: 500 }
    )
  }
}

// PUT /api/income/[id] - Update a specific income
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate that unitId is present when scope is "Unit"
    if (body.scope === "Unit" && !body.unitId) {
      return NextResponse.json(
        { error: "unitId is required when scope is 'Unit'" },
        { status: 400 }
      )
    }

    const updatedIncome = await updateIncome(id, body)

    if (!updatedIncome) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 })
    }

    return NextResponse.json(updatedIncome)
  } catch (error) {
    console.error("Failed to update income:", error)
    return NextResponse.json(
      { error: "Failed to update income" },
      { status: 500 }
    )
  }
}

// DELETE /api/income/[id] - Delete a specific income
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await deleteIncome(id)

    if (!success) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete income:", error)
    return NextResponse.json(
      { error: "Failed to delete income" },
      { status: 500 }
    )
  }
}
