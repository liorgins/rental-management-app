import { createNotification } from "@/lib/kv-service"
import { NextRequest, NextResponse } from "next/server"

export async function POST(_request: NextRequest) {
  try {
    // Create some sample notifications for testing
    const sampleNotifications = [
      {
        type: "task_reminder" as const,
        title: "Task Reminder: Fix Kitchen Faucet",
        message: "Task 'Fix Kitchen Faucet' is due in 2 days",
        isRead: false,
      },
      {
        type: "task_overdue" as const,
        title: "Task Overdue: Inspect HVAC System",
        message:
          "Task 'Inspect HVAC System' is now overdue and needs immediate attention",
        isRead: false,
      },
      {
        type: "task_completed" as const,
        title: "Task Completed: Paint Bedroom",
        message: "Task 'Paint Bedroom' has been marked as completed",
        isRead: true,
      },
      {
        type: "system" as const,
        title: "Welcome to Rental Management",
        message:
          "Your notification system is now active and ready to help you stay organized",
        isRead: false,
      },
      {
        type: "task_reminder" as const,
        title: "Task Reminder: Monthly Inspection",
        message: "Task 'Monthly Inspection' is due tomorrow",
        isRead: false,
      },
    ]

    const createdNotifications = []
    for (const notification of sampleNotifications) {
      const created = await createNotification(notification)
      createdNotifications.push(created)
    }

    return NextResponse.json({
      success: true,
      message: "Sample notifications created",
      notifications: createdNotifications,
    })
  } catch (error) {
    console.error("Error creating test notifications:", error)
    return NextResponse.json(
      { error: "Failed to create test notifications" },
      { status: 500 }
    )
  }
}
