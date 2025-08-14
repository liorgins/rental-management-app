import { NextResponse } from "next/server"

import { deleteExpense, getExpense, updateExpense } from "@/lib/kv-service"

// GET /api/expenses/[id] - Get a specific expense
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const expense = await getExpense(id)

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error("Failed to fetch expense:", error)
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 }
    )
  }
}

// PUT /api/expenses/[id] - Update a specific expense
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

    const updatedExpense = await updateExpense(id, body)

    if (!updatedExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error("Failed to update expense:", error)
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    )
  }
}

// DELETE /api/expenses/[id] - Delete a specific expense
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await deleteExpense(id)

    if (!success) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete expense:", error)
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    )
  }
}
