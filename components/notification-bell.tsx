"use client"

import { IconBell } from "@tabler/icons-react"
import { Check, CheckCheck } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

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
  useMarkMultipleNotificationsAsSeen,
  useMarkNotificationAsRead,
  useNewNotifications,
  useRecentNotifications,
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

// Hook to detect if an element is in view
function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => callbackRef.current(entries),
      {
        threshold: 0.5, // Trigger when 50% of the element is visible
        ...options,
      }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [options])

  const addNode = useCallback((node: Element | null, _id: string) => {
    if (!node || !observerRef.current) return
    observerRef.current.observe(node)
  }, [])

  const removeNode = useCallback((node: Element) => {
    if (!observerRef.current) return
    observerRef.current.unobserve(node)
  }, [])

  return { addNode, removeNode }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)

  const { data: newNotifications = [] } = useNewNotifications()
  const { data: recentNotifications = [] } = useRecentNotifications(10)

  const markAsRead = useMarkNotificationAsRead()
  // const _markAsSeen = useMarkNotificationAsSeen() // Available for future use
  const markMultipleAsSeen = useMarkMultipleNotificationsAsSeen()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const newCount = newNotifications.length

  // Use refs to access current data without triggering re-renders
  const recentNotificationsRef = useRef(recentNotifications)
  const markMultipleAsSeenRef = useRef(markMultipleAsSeen)

  useEffect(() => {
    recentNotificationsRef.current = recentNotifications
  }, [recentNotifications])

  useEffect(() => {
    markMultipleAsSeenRef.current = markMultipleAsSeen
  }, [markMultipleAsSeen])

  // Handle intersection observer callback
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const visibleIds: string[] = []

      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          entry.target.getAttribute("data-notification-id")
        ) {
          const id = entry.target.getAttribute("data-notification-id")!
          visibleIds.push(id)
        }
      })

      // Mark visible "new" notifications as "seen"
      if (visibleIds.length > 0) {
        const currentNotifications = recentNotificationsRef.current
        const newNotificationIds = visibleIds.filter(
          (id) =>
            currentNotifications.find((n) => n.id === id)?.status === "new"
        )

        if (newNotificationIds.length > 0) {
          // Small delay to ensure user has actually "seen" the notification
          setTimeout(() => {
            markMultipleAsSeenRef.current.mutate(newNotificationIds)
          }, 1000)
        }
      }
    },
    [] // Empty dependency array to prevent re-creation
  )

  const { addNode } = useIntersectionObserver(handleIntersection)

  const handleNotificationClick = (notification: AppNotification) => {
    // If clicking on a new or seen notification, mark as read
    if (notification.status !== "read") {
      markAsRead.mutate(notification.id)
    }

    // Optionally navigate to related task/unit
    if (notification.taskId) {
      window.location.href = `/tasks`
    }
  }

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    markAsRead.mutate(notificationId)
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
              newCount > 0 && "animate-pulse text-primary"
            )}
            style={{
              animation:
                newCount > 0 ? "wiggle 0.5s ease-in-out infinite" : "none",
            }}
          />
          {newCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {newCount > 9 ? "9+" : newCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {recentNotifications.some((n) => n.status !== "read") && (
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
                ref={(node) => {
                  if (node) {
                    addNode(node, notification.id)
                  }
                }}
                data-notification-id={notification.id}
                className={cn(
                  "group relative flex flex-col items-start p-4 cursor-pointer hover:bg-muted/50 focus:bg-muted/50",
                  notification.status === "new" &&
                    "bg-primary/5 border-l-2 border-l-primary",
                  notification.status === "seen" && "bg-muted/20"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="text-lg flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm truncate",
                          notification.status === "read"
                            ? "font-normal"
                            : "font-semibold"
                        )}
                      >
                        {notification.title}
                      </p>
                      {notification.status === "new" && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-xs text-muted-foreground mt-1 line-clamp-2",
                        notification.status === "read"
                          ? "font-normal"
                          : "font-medium"
                      )}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTimeAgo(new Date(notification.createdAt))}
                    </p>
                  </div>

                  {/* Hover checkmark for marking as read */}
                  {notification.status !== "read" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-primary/20 flex-shrink-0"
                      onClick={(e) => handleMarkAsRead(e, notification.id)}
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
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
