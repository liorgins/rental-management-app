import { createNotification, getTasks, updateTask } from "./kv-service"
import type { Task } from "./types"
import { WebPushService } from "./web-push-service"

export class NotificationScheduler {
  /**
   * Check for tasks that need reminder notifications and send them
   */
  static async processReminders(): Promise<{
    totalTasks: number
    activeTasks: number
    remindersSent: number
    dueNotificationsSent: number
    processedReminders: string[]
    processedDueNotifications: string[]
  }> {
    const result = {
      totalTasks: 0,
      activeTasks: 0,
      remindersSent: 0,
      dueNotificationsSent: 0,
      processedReminders: [] as string[],
      processedDueNotifications: [] as string[],
    }

    try {
      const tasks = await getTasks()
      const now = new Date()
      result.totalTasks = tasks.length

      console.log(`📊 Processing ${tasks.length} total tasks`)

      for (const task of tasks) {
        // Skip completed tasks
        if (task.status === "Completed") {
          continue
        }

        result.activeTasks++

        // Check each reminder for this task
        for (const reminder of task.reminders) {
          const reminderDate = new Date(reminder.scheduledFor)

          // If reminder time has passed and notification hasn't been sent
          if (reminderDate <= now && !reminder.notificationSent) {
            console.log(
              `🔔 Sending reminder for task: ${task.title} (due ${task.dueDate})`
            )
            const success = await this.sendTaskReminder(task, reminder.id)
            if (success) {
              result.remindersSent++
              result.processedReminders.push(
                `${task.title} (${reminder.period})`
              )
            }
          }
        }

        // Check if task is due today and send due notification
        const dueDate = new Date(task.dueDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dueDate.setHours(0, 0, 0, 0)

        if (dueDate.getTime() === today.getTime()) {
          console.log(`📅 Sending due notification for task: ${task.title}`)
          const success = await this.sendTaskDueNotification(task)
          if (success) {
            result.dueNotificationsSent++
            result.processedDueNotifications.push(task.title)
          }
        }
      }

      console.log(`✅ Reminder processing complete:`, {
        totalTasks: result.totalTasks,
        activeTasks: result.activeTasks,
        remindersSent: result.remindersSent,
        dueNotificationsSent: result.dueNotificationsSent,
      })

      return result
    } catch (error) {
      console.error("Error processing reminders:", error)
      throw error
    }
  }

  /**
   * Send a reminder notification for a specific task and reminder
   */
  private static async sendTaskReminder(
    task: Task,
    reminderId: string
  ): Promise<boolean> {
    try {
      // Send the push notification
      await WebPushService.sendTaskReminder(task)

      // Create in-app notification
      const reminder = task.reminders.find((r) => r.id === reminderId)
      const daysBeforeDue = reminder?.customDays || 1
      await createNotification({
        type: "task_reminder",
        title: `Task Reminder: ${task.title}`,
        message: `Task "${task.title}" is due in ${daysBeforeDue} day${
          daysBeforeDue !== 1 ? "s" : ""
        }`,
        taskId: task.id,
        unitId: task.unitId,
        isRead: false,
      })

      // Mark reminder as sent
      const updatedReminders = task.reminders.map((reminder) =>
        reminder.id === reminderId
          ? { ...reminder, notificationSent: true }
          : reminder
      )

      await updateTask(task.id, { reminders: updatedReminders })

      console.log(`✅ Reminder sent for task: ${task.title}`)
      return true
    } catch (error) {
      console.error(`❌ Error sending reminder for task ${task.id}:`, error)
      return false
    }
  }

  /**
   * Send a due notification for a task
   */
  private static async sendTaskDueNotification(task: Task): Promise<boolean> {
    try {
      // Send push notification
      await WebPushService.sendTaskDue(task)

      // Create in-app notification
      await createNotification({
        type: "task_overdue",
        title: `Task Overdue: ${task.title}`,
        message: `Task "${task.title}" is now overdue and needs immediate attention`,
        taskId: task.id,
        unitId: task.unitId,
        isRead: false,
      })

      console.log(`✅ Due notification sent for task: ${task.title}`)
      return true
    } catch (error) {
      console.error(
        `❌ Error sending due notification for task ${task.id}:`,
        error
      )
      return false
    }
  }

  /**
   * Get tasks that need reminders in the next specified hours
   */
  static async getUpcomingReminders(hoursAhead: number = 24): Promise<Task[]> {
    try {
      const tasks = await getTasks()
      const now = new Date()
      const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)

      return tasks.filter((task) => {
        if (task.status === "Completed") {
          return false
        }

        return task.reminders.some((reminder) => {
          const reminderDate = new Date(reminder.scheduledFor)
          return (
            reminderDate >= now &&
            reminderDate <= futureTime &&
            !reminder.notificationSent
          )
        })
      })
    } catch (error) {
      console.error("Error getting upcoming reminders:", error)
      return []
    }
  }

  /**
   * Get tasks that are overdue
   */
  static async getOverdueTasks(): Promise<Task[]> {
    try {
      const tasks = await getTasks()
      const now = new Date()

      return tasks.filter((task) => {
        if (task.status === "Completed") {
          return false
        }

        const dueDate = new Date(task.dueDate)
        return dueDate < now
      })
    } catch (error) {
      console.error("Error getting overdue tasks:", error)
      return []
    }
  }

  /**
   * Initialize reminders for a new task
   */
  static generateReminders(
    dueDate: string,
    reminderDays: number[]
  ): Array<{
    id: string
    period: "1_day" | "2_days" | "1_week" | "custom"
    customDays?: number
    notificationSent: boolean
    scheduledFor: string
  }> {
    const due = new Date(dueDate)

    return reminderDays.map((days, index) => {
      const reminderDate = new Date(due)
      reminderDate.setDate(reminderDate.getDate() - days)

      return {
        id: `reminder-${Date.now()}-${index}`,
        period:
          days === 1
            ? "1_day"
            : days === 2
            ? "2_days"
            : days === 7
            ? "1_week"
            : "custom",
        customDays:
          days > 7 || (days !== 1 && days !== 2 && days !== 7)
            ? days
            : undefined,
        notificationSent: false,
        scheduledFor: reminderDate.toISOString(),
      }
    })
  }
}

// Utility function to start the reminder checking process
export function startReminderScheduler(
  intervalMinutes: number = 15
): NodeJS.Timeout {
  const intervalMs = intervalMinutes * 60 * 1000

  // Run immediately on start
  NotificationScheduler.processReminders()

  // Then run on interval
  return setInterval(() => {
    NotificationScheduler.processReminders()
  }, intervalMs)
}
