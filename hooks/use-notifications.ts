"use client"

import {
  createNotification,
  getNotifications,
  getRecentNotifications,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/kv-service"
import type { NotificationType } from "@/lib/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: getUnreadNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useRecentNotifications(limit: number = 5) {
  return useQuery({
    queryKey: ["notifications", "recent", limit],
    queryFn: () => getRecentNotifications(limit),
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
      createNotification({
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
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
