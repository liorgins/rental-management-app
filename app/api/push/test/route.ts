import { WebPushService } from "@/lib/web-push-service"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const payload = {
      title: body.title || "Test Notification",
      body:
        body.body ||
        "This is a test notification from your rental management app",
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: "test-notification",
      data: {
        url: body.url || "/tasks",
      },
    }

    await WebPushService.sendToAllSubscriptions(payload)

    return NextResponse.json({
      success: true,
      message: "Test notification sent to all subscriptions",
    })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    )
  }
}
