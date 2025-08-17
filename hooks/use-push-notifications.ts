"use client"

import { useEffect, useState } from "react"

interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  requestPermission: () => Promise<NotificationPermission>
}

// VAPID public key from environment variable
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] =
    useState<NotificationPermission>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = "serviceWorker" in navigator && "PushManager" in window
      setIsSupported(supported)

      if ("Notification" in window) {
        setPermission(Notification.permission)
      }

      if (supported) {
        checkSubscriptionStatus()
        registerServiceWorker()
      }
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })
        console.log("Service Worker registered:", registration)
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error)
    }
  }

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error("Error checking subscription status:", error)
    }
  }

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return "denied"
    }

    try {
      const newPermission = await Notification.requestPermission()
      setPermission(newPermission)
      return newPermission
    } catch (error) {
      console.error("Error requesting permission:", error)
      return "denied"
    }
  }

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      console.error("Push notifications not supported")
      return false
    }

    try {
      // Request permission if not granted
      if (permission !== "granted") {
        const newPermission = await requestPermission()
        if (newPermission !== "granted") {
          return false
        }
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY || ""),
      })

      // Send subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.getKey("p256dh")
                ? btoa(
                    String.fromCharCode(
                      ...new Uint8Array(subscription.getKey("p256dh")!)
                    )
                  )
                : "",
              auth: subscription.getKey("auth")
                ? btoa(
                    String.fromCharCode(
                      ...new Uint8Array(subscription.getKey("auth")!)
                    )
                  )
                : "",
            },
          },
        }),
      })

      if (response.ok) {
        setIsSubscribed(true)
        console.log("Successfully subscribed to push notifications")
        return true
      } else {
        console.error("Failed to save subscription to server")
        return false
      }
    } catch (error) {
      console.error("Error subscribing to push notifications:", error)
      return false
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Remove subscription from server
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        })

        // Unsubscribe from browser
        await subscription.unsubscribe()
        setIsSubscribed(false)
        console.log("Successfully unsubscribed from push notifications")
        return true
      }
      return false
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error)
      return false
    }
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    requestPermission,
  }
}
