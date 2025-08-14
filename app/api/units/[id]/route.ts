import { NextResponse } from "next/server"

import { deleteUnit, getUnit, updateUnit } from "@/lib/kv-service"

// GET /api/units/[id] - Get a specific unit
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const unit = await getUnit(id)

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    }

    return NextResponse.json(unit)
  } catch (error) {
    console.error("Failed to fetch unit:", error)
    return NextResponse.json({ error: "Failed to fetch unit" }, { status: 500 })
  }
}

// PUT /api/units/[id] - Update a specific unit
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updatedUnit = await updateUnit(id, body)

    if (!updatedUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    }

    return NextResponse.json(updatedUnit)
  } catch (error) {
    console.error("Failed to update unit:", error)
    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    )
  }
}

// DELETE /api/units/[id] - Delete a specific unit
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await deleteUnit(id)

    if (!success) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete unit:", error)
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    )
  }
}
