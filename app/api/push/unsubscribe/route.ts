import { deletePushSubscription } from "@/lib/kv-service"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 }
      )
    }

    const success = await deletePushSubscription(body.endpoint)

    return NextResponse.json({
      success,
      message: success ? "Unsubscribed successfully" : "Subscription not found",
    })
  } catch (error) {
    console.error("Error removing push subscription:", error)
    return NextResponse.json(
      { error: "Failed to remove subscription" },
      { status: 500 }
    )
  }
}
