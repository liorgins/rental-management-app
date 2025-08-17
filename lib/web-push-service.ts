import webpush from "web-push"
import { getPushSubscriptions } from "./kv-service"
import type { PushSubscription as CustomPushSubscription, Task } from "./types"

// VAPID keys - these should be environment variables in production
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_EMAIL = process.env.VAPID_EMAIL

// Configure web-push
webpush.setVapidDetails(
  VAPID_EMAIL || "",
  VAPID_PUBLIC_KEY || "",
  VAPID_PRIVATE_KEY || ""
)

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: {
    taskId?: string
    url?: string
    [key: string]: unknown
  }
}

export class WebPushService {
  static async sendNotification(
    subscription: CustomPushSubscription,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      }

      await webpush.sendNotification(pushSubscription, JSON.stringify(payload))

      console.log("Push notification sent successfully")
      return true
    } catch (error) {
      console.error("Error sending push notification:", error)
      return false
    }
  }

  static async sendToAllSubscriptions(
    payload: NotificationPayload
  ): Promise<void> {
    try {
      const subscriptions = await getPushSubscriptions()

      const sendPromises = subscriptions.map((subscription) =>
        this.sendNotification(subscription, payload)
      )

      await Promise.allSettled(sendPromises)
    } catch (error) {
      console.error("Error sending notifications to all subscriptions:", error)
    }
  }

  static async sendTaskReminder(task: Task): Promise<void> {
    const payload: NotificationPayload = {
      title: "Task Reminder",
      body: `"${task.title}" is due ${this.formatDueDate(task.dueDate)}`,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: `task-reminder-${task.id}`,
      data: {
        taskId: task.id,
        url: "/tasks",
      },
    }

    await this.sendToAllSubscriptions(payload)
  }

  static async sendTaskDue(task: Task): Promise<void> {
    const payload: NotificationPayload = {
      title: "Task Due Today",
      body: `"${task.title}" is due today!`,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: `task-due-${task.id}`,
      data: {
        taskId: task.id,
        url: "/tasks",
      },
    }

    await this.sendToAllSubscriptions(payload)
  }

  private static formatDueDate(dueDateStr: string): string {
    const dueDate = new Date(dueDateStr)
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "today"
    } else if (diffDays === 1) {
      return "tomorrow"
    } else if (diffDays > 0) {
      return `in ${diffDays} days`
    } else {
      return `${Math.abs(diffDays)} days ago`
    }
  }
}

// Generate VAPID keys utility (for development)
export function generateVapidKeys() {
  return webpush.generateVAPIDKeys()
}
