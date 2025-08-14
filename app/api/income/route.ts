import { NextResponse } from "next/server"

import { createIncome, getIncomes, initializeData } from "@/lib/kv-service"
import type { Income } from "@/lib/types"

// GET /api/income - Get all income
export async function GET(request: Request) {
  try {
    // Initialize data on first load
    await initializeData()

    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get("unitId")
    const scope = searchParams.get("scope")

    const incomes = await getIncomes()

    // Filter incomes based on query parameters
    let filteredIncomes = incomes

    if (unitId) {
      filteredIncomes = incomes.filter(
        (income) => income.scope === "Unit" && income.unitId === unitId
      )
    } else if (scope === "global") {
      filteredIncomes = incomes.filter(
        (income) => income.scope === "Global"
      )
    }

    return NextResponse.json(filteredIncomes)
  } catch (error) {
    console.error("Failed to fetch incomes:", error)
    return NextResponse.json(
      { error: "Failed to fetch incomes" },
      { status: 500 }
    )
  }
}

// POST /api/income - Create a new income
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

    const income: Income = {
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

    const newIncome = await createIncome(income)
    return NextResponse.json(newIncome, { status: 201 })
  } catch (error) {
    console.error("Failed to create income:", error)
    return NextResponse.json(
      { error: "Failed to create income" },
      { status: 500 }
    )
  }
}
