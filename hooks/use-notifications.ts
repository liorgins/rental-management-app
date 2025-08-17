"use client"

import type { AppNotification, NotificationType } from "@/lib/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

async function fetchNotifications(): Promise<AppNotification[]> {
  const response = await fetch("/api/notifications")
  if (!response.ok) {
    throw new Error("Failed to fetch notifications")
  }
  return response.json()
}

async function fetchUnreadNotifications(): Promise<AppNotification[]> {
  const response = await fetch("/api/notifications?type=unread")
  if (!response.ok) {
    throw new Error("Failed to fetch unread notifications")
  }
  return response.json()
}

async function fetchNewNotifications(): Promise<AppNotification[]> {
  const response = await fetch("/api/notifications?type=new")
  if (!response.ok) {
    throw new Error("Failed to fetch new notifications")
  }
  return response.json()
}

async function fetchRecentNotifications(
  limit: number
): Promise<AppNotification[]> {
  const response = await fetch(`/api/notifications?type=recent&limit=${limit}`)
  if (!response.ok) {
    throw new Error("Failed to fetch recent notifications")
  }
  return response.json()
}

async function markNotificationAsReadApi(id: string): Promise<void> {
  const response = await fetch("/api/notifications", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "mark_read", id }),
  })
  if (!response.ok) {
    throw new Error("Failed to mark notification as read")
  }
}

async function markNotificationAsSeenApi(id: string): Promise<void> {
  const response = await fetch("/api/notifications", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "mark_seen", id }),
  })
  if (!response.ok) {
    throw new Error("Failed to mark notification as seen")
  }
}

async function markMultipleNotificationsAsSeenApi(
  ids: string[]
): Promise<void> {
  const response = await fetch("/api/notifications", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "mark_multiple_seen", ids }),
  })
  if (!response.ok) {
    throw new Error("Failed to mark notifications as seen")
  }
}

async function markAllNotificationsAsReadApi(): Promise<void> {
  const response = await fetch("/api/notifications", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "mark_all_read" }),
  })
  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read")
  }
}

async function createNotificationApi(notification: {
  type: NotificationType
  title: string
  message: string
  taskId?: string
  unitId?: string
  isRead?: boolean
}): Promise<AppNotification> {
  const response = await fetch("/api/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notification),
  })
  if (!response.ok) {
    throw new Error("Failed to create notification")
  }
  return response.json()
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: fetchUnreadNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useNewNotifications() {
  return useQuery({
    queryKey: ["notifications", "new"],
    queryFn: fetchNewNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useRecentNotifications(limit: number = 5) {
  return useQuery({
    queryKey: ["notifications", "recent", limit],
    queryFn: () => fetchRecentNotifications(limit),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notification: {
      type: NotificationType
      title: string
      message: string
      taskId?: string
      unitId?: string
      isRead?: boolean
    }) =>
      createNotificationApi({
        ...notification,
        isRead: notification.isRead ?? false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationAsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkNotificationAsSeen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationAsSeenApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkMultipleNotificationsAsSeen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markMultipleNotificationsAsSeenApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsAsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
