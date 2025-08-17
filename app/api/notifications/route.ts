import {
  createNotification,
  getNotifications,
  getRecentNotifications,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/kv-service"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const limit = searchParams.get("limit")

    if (type === "unread") {
      const notifications = await getUnreadNotifications()
      return NextResponse.json(notifications)
    }

    if (type === "recent") {
      const limitNum = limit ? parseInt(limit, 10) : 5
      const notifications = await getRecentNotifications(limitNum)
      return NextResponse.json(notifications)
    }

    // Default: return all notifications
    const notifications = await getNotifications()
    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, taskId, unitId, isRead } = body

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Type, title, and message are required" },
        { status: 400 }
      )
    }

    const notification = await createNotification({
      type,
      title,
      message,
      taskId,
      unitId,
      isRead: isRead ?? false,
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, id } = body

    if (action === "mark_read" && id) {
      await markNotificationAsRead(id)
      return NextResponse.json({ success: true })
    }

    if (action === "mark_all_read") {
      await markAllNotificationsAsRead()
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}
