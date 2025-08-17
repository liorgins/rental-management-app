"use client"

import { IconBell } from "@tabler/icons-react"
// Using native Date methods instead of date-fns
import { CheckCheck } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useRecentNotifications,
  useUnreadNotifications,
} from "@/hooks/use-notifications"
import type { AppNotification } from "@/lib/types"
import { cn } from "@/lib/utils"

// Simple function to format relative time
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return "just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: unreadNotifications = [] } = useUnreadNotifications()
  const { data: recentNotifications = [] } = useRecentNotifications(5)
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const unreadCount = unreadNotifications.length

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id)
    }
    // Optionally navigate to related task/unit
    if (notification.taskId) {
      // Navigate to task details or tasks page
      window.location.href = `/tasks`
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  const getNotificationIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "task_reminder":
        return "⏰"
      case "task_overdue":
        return "🚨"
      case "task_completed":
        return "✅"
      case "system":
        return "📢"
      default:
        return "📬"
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-muted"
        >
          <IconBell
            className={cn(
              "h-5 w-5 transition-all duration-300",
              unreadCount > 0 && "animate-pulse text-primary"
            )}
            style={{
              animation:
                unreadCount > 0 ? "wiggle 0.5s ease-in-out infinite" : "none",
            }}
          />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {recentNotifications.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-4 cursor-pointer hover:bg-muted/50",
                  !notification.isRead &&
                    "bg-primary/5 border-l-2 border-l-primary"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="text-lg flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTimeAgo(new Date(notification.createdAt))}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <IconBell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        )}

        {recentNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => {
                  setOpen(false)
                  // Navigate to full notifications page if you have one
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
