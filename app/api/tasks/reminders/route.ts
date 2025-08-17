import { NotificationScheduler } from "@/lib/notification-scheduler"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Check for Vercel cron header or authorization
    const cronHeader = request.headers.get("authorization")
    const vercelCronHeader = request.headers.get("x-vercel-cron-signature")
    const expectedKey = process.env.CRON_SECRET || "dev-secret"

    // Allow either Vercel cron or manual auth
    const isVercelCron = !!vercelCronHeader
    const isAuthorized = cronHeader === `Bearer ${expectedKey}`

    if (!isVercelCron && !isAuthorized) {
      console.log("Unauthorized cron attempt:", {
        cronHeader,
        hasVercelHeader: !!vercelCronHeader,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`🕐 Processing reminders at ${new Date().toISOString()}`, {
      source: isVercelCron ? "vercel-cron" : "manual",
      timestamp: new Date().toISOString(),
    })

    const result = await NotificationScheduler.processReminders()
    const duration = Date.now() - startTime

    console.log(`✅ Reminders processed in ${duration}ms`, {
      ...result,
      duration,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Reminders processed successfully",
      timestamp: new Date().toISOString(),
      duration,
      ...result,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error("❌ Error processing reminders:", error, { duration })

    return NextResponse.json(
      {
        error: "Failed to process reminders",
        timestamp: new Date().toISOString(),
        duration,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const upcomingReminders = await NotificationScheduler.getUpcomingReminders(
      24
    )
    const overdueTasks = await NotificationScheduler.getOverdueTasks()

    return NextResponse.json({
      upcomingReminders: upcomingReminders.length,
      overdueTasks: overdueTasks.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error getting reminder status:", error)
    return NextResponse.json(
      { error: "Failed to get reminder status" },
      { status: 500 }
    )
  }
}
