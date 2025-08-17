import { createPushSubscription } from "@/lib/kv-service"
import type { PushSubscription } from "@/lib/types"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (
      !body.subscription ||
      !body.subscription.endpoint ||
      !body.subscription.keys
    ) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      )
    }

    const subscription: PushSubscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      endpoint: body.subscription.endpoint,
      keys: {
        p256dh: body.subscription.keys.p256dh,
        auth: body.subscription.keys.auth,
      },
      createdAt: new Date().toISOString(),
    }

    const createdSubscription = await createPushSubscription(subscription)

    return NextResponse.json({
      success: true,
      subscription: createdSubscription,
    })
  } catch (error) {
    console.error("Error creating push subscription:", error)
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    )
  }
}
