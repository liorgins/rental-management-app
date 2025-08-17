"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { Bell, BellOff, Send, Settings } from "lucide-react"
import { useState } from "react"
import { PushNotificationHelp } from "./push-notification-help"

export function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    requestPermission,
  } = usePushNotifications()

  const [isLoading, setIsLoading] = useState(false)
  const [testNotificationSent, setTestNotificationSent] = useState(false)

  const handleSubscribe = async () => {
    setIsLoading(true)
    try {
      await subscribe()
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setIsLoading(true)
    try {
      await unsubscribe()
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestNotification = async () => {
    try {
      const response = await fetch("/api/notifications/test-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Push Notification",
          message:
            "This is a test notification from your rental management app. If you receive this when the browser is closed, your setup is working correctly!",
        }),
      })

      if (response.ok) {
        setTestNotificationSent(true)
        setTimeout(() => setTestNotificationSent(false), 3000)
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
    }
  }

  const sendBrowserNotification = async () => {
    try {
      // Test direct browser notification (not push)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Direct Browser Test", {
          body: "This is a direct browser notification test",
          icon: "/icon.svg",
          tag: "browser-test",
        })
        console.log("Direct browser notification sent")
      } else {
        console.log("Notification permission not granted or not supported")
      }
    } catch (error) {
      console.error("Error with direct browser notification:", error)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-500">
            <BellOff className="h-5 w-5" />
            <span>Push notifications are not supported in your browser</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return <Badge className="bg-green-100 text-emerald-800">Granted</Badge>
      case "denied":
        return <Badge className="bg-rose-100 text-red-500">Denied</Badge>
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Not Requested</Badge>
        )
    }
  }

  const getSubscriptionBadge = () => {
    if (isSubscribed) {
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Push Notification Settings
          </CardTitle>
          <PushNotificationHelp />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser compatibility warning */}
        {typeof window !== "undefined" &&
          window.navigator.userAgent.includes("Mac") &&
          (window.navigator.userAgent.includes("Chrome") ||
            window.navigator.userAgent.includes("Edg")) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start gap-2">
                <Bell className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">
                    Browser Limitation
                  </p>
                  <p className="text-amber-700 mt-1">
                    Chrome/Edge on macOS may not receive notifications when
                    completely closed. Keep your browser minimized or see help
                    for setup instructions.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Permission Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Permission Status</span>
            {getPermissionBadge()}
          </div>
          <p className="text-sm text-gray-600">
            Notifications permission controls whether this app can send you
            notifications.
          </p>
        </div>

        {/* Subscription Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subscription Status</span>
            {getSubscriptionBadge()}
          </div>
          <p className="text-sm text-gray-600">
            Subscribe to receive task reminders and notifications on this
            device.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {permission === "default" && (
            <Button
              onClick={requestPermission}
              className="w-full"
              disabled={isLoading}
            >
              <Bell className="h-4 w-4 mr-2" />
              Request Permission
            </Button>
          )}

          {permission === "granted" && !isSubscribed && (
            <Button
              onClick={handleSubscribe}
              className="w-full"
              disabled={isLoading}
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? "Subscribing..." : "Enable Notifications"}
            </Button>
          )}

          {permission === "granted" && isSubscribed && (
            <div className="space-y-2">
              <Button
                onClick={handleUnsubscribe}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <BellOff className="h-4 w-4 mr-2" />
                {isLoading ? "Unsubscribing..." : "Disable Notifications"}
              </Button>

              <Button
                onClick={sendTestNotification}
                variant="secondary"
                className="w-full"
                disabled={testNotificationSent}
              >
                <Send className="h-4 w-4 mr-2" />
                {testNotificationSent ? "Test Sent!" : "Send Test Notification"}
              </Button>

              <Button
                onClick={sendBrowserNotification}
                variant="outline"
                className="w-full mt-2"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Direct Browser Notification
              </Button>
            </div>
          )}

          {permission === "denied" && (
            <div className="text-sm text-gray-600">
              <p>Notifications are blocked. To enable them:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Click the lock icon in your browser&apos;s address bar</li>
                <li>Set notifications to &quot;Allow&quot;</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            What notifications will you receive?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Task reminders (1-2 days before due date)</li>
            <li>• Overdue task notifications</li>
            <li>• Important updates and deadlines</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
