import { WebPushService } from "@/lib/web-push-service"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title = "Test Notification",
      message = "This is a test push notification",
    } = body

    // Send test push notification to all subscribers
    await WebPushService.sendToAllSubscriptions({
      title,
      body: message,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: "test-notification",
      data: {
        url: "/tasks",
        test: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Test push notification sent to all subscribers",
    })
  } catch (error) {
    console.error("Error sending test push notification:", error)
    return NextResponse.json(
      { error: "Failed to send test push notification" },
      { status: 500 }
    )
  }
}
