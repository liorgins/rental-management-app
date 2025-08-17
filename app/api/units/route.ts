import { NextResponse } from "next/server"

import { createUnit, getUnits, initializeData } from "@/lib/kv-service"
import type { Unit } from "@/lib/types"

// GET /api/units - Get all units
export async function GET() {
  try {
    // Initialize data on first load
    await initializeData()
    const units = await getUnits()
    return NextResponse.json(units)
  } catch (error) {
    console.error("Failed to fetch units:", error)
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    )
  }
}

// POST /api/units - Create a new unit
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "id",
      "name",
      "property",
      "address",
      "monthlyRent",
      "tenant",
      "contractStart",
    ]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const unit: Unit = {
      id: body.id,
      name: body.name,
      property: body.property,
      address: body.address,
      monthlyRent: body.monthlyRent,
      tenant: body.tenant,
      contractStart: body.contractStart,
      contractEnd: body.contractEnd,
    }

    const newUnit = await createUnit(unit)
    return NextResponse.json(newUnit, { status: 201 })
  } catch (error) {
    console.error("Failed to create unit:", error)
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    )
  }
}
