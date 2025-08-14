import { NextResponse } from "next/server"

import { createExpense, getExpenses, initializeData } from "@/lib/kv-service"
import type { Expense } from "@/lib/types"

// GET /api/expenses - Get all expenses
export async function GET(request: Request) {
  try {
    // Initialize data on first load
    await initializeData()

    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get("unitId")
    const scope = searchParams.get("scope")

    const expenses = await getExpenses()

    // Filter expenses based on query parameters
    let filteredExpenses = expenses

    if (unitId) {
      filteredExpenses = expenses.filter(
        (expense) => expense.scope === "Unit" && expense.unitId === unitId
      )
    } else if (scope === "global") {
      filteredExpenses = expenses.filter(
        (expense) => expense.scope === "Global"
      )
    }

    return NextResponse.json(filteredExpenses)
  } catch (error) {
    console.error("Failed to fetch expenses:", error)
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    )
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "id",
      "title",
      "amount",
      "date",
      "category",
      "scope",
      "recurrence",
    ]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate that unitId is present when scope is "Unit"
    if (body.scope === "Unit" && !body.unitId) {
      return NextResponse.json(
        { error: "unitId is required when scope is 'Unit'" },
        { status: 400 }
      )
    }

    const expense: Expense = {
      id: body.id,
      title: body.title,
      amount: body.amount,
      date: body.date,
      category: body.category,
      scope: body.scope,
      unitId: body.unitId,
      recurrence: body.recurrence,
      notes: body.notes,
    }

    const newExpense = await createExpense(expense)
    return NextResponse.json(newExpense, { status: 201 })
  } catch (error) {
    console.error("Failed to create expense:", error)
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    )
  }
}
