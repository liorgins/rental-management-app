import { NotificationScheduler } from "@/lib/notification-scheduler"
import { NextResponse } from "next/server"

export async function GET() {
  console.log("Getting cron status")
  try {
    const upcomingReminders = await NotificationScheduler.getUpcomingReminders(
      24
    )
    const overdueTasks = await NotificationScheduler.getOverdueTasks()

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      stats: {
        upcomingReminders: upcomingReminders.length,
        overdueTasks: overdueTasks.length,
        nextReminders: upcomingReminders.slice(0, 5).map((task) => ({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate,
          reminders: task.reminders.filter((r) => !r.notificationSent).length,
        })),
        overdueTaskTitles: overdueTasks.slice(0, 5).map((task) => ({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate,
          daysOverdue: Math.ceil(
            (new Date().getTime() - new Date(task.dueDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        })),
      },
      cronInfo: {
        schedule: "Every minute (*/1 * * * *)",
        endpoint: "/api/tasks/reminders",
        lastRun: "Check Vercel Functions logs",
        nextRun: "Every 1 minutes",
      },
    })
  } catch (error) {
    console.error("Error getting cron status:", error)
    return NextResponse.json(
      {
        status: "error",
        error: "Failed to get cron status",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
