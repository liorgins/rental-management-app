"use client"

import { AlertCircle, Chrome, Info } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function detectBrowser() {
  if (typeof window === "undefined") return "unknown"

  const userAgent = window.navigator.userAgent

  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    return "chrome"
  } else if (userAgent.includes("Edg")) {
    return "edge"
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return "safari"
  } else if (userAgent.includes("Firefox")) {
    return "firefox"
  }

  return "unknown"
}

function detectOS() {
  if (typeof window === "undefined") return "unknown"

  const userAgent = window.navigator.userAgent

  if (userAgent.includes("Mac")) {
    return "mac"
  } else if (userAgent.includes("Win")) {
    return "windows"
  } else if (userAgent.includes("Linux")) {
    return "linux"
  }

  return "unknown"
}

export function PushNotificationHelp() {
  const [open, setOpen] = useState(false)
  const browser = detectBrowser()
  const os = detectOS()

  const getBrowserIcon = () => {
    switch (browser) {
      case "chrome":
      case "edge":
        return <Chrome className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getInstructions = () => {
    if (browser === "safari") {
      return {
        title: "Safari - Good News! 🎉",
        description: "Safari can receive notifications even when closed.",
        steps: [
          "Your notifications should work when Safari is closed",
          "Make sure notifications are enabled in Safari preferences",
          "Check macOS System Preferences > Notifications > Safari",
        ],
        limitation: false,
      }
    }

    if ((browser === "chrome" || browser === "edge") && os === "mac") {
      return {
        title: "Chrome/Edge on macOS - Requires Setup",
        description:
          "These browsers need special settings to receive notifications when closed.",
        steps: [
          "1. Open Chrome/Edge Settings",
          "2. Go to Advanced → System",
          "3. Enable 'Continue running background apps when Chrome is closed'",
          "4. Restart your browser",
          "⚠️ Note: This setting may reset after macOS updates",
        ],
        limitation: true,
      }
    }

    if ((browser === "chrome" || browser === "edge") && os === "windows") {
      return {
        title: "Chrome/Edge on Windows - Should Work",
        description: "Notifications should work when browser is closed.",
        steps: [
          "Your notifications should work when browser is closed",
          "Make sure notifications are enabled in browser settings",
          "Check Windows notification settings if issues persist",
        ],
        limitation: false,
      }
    }

    return {
      title: "Browser Limitations",
      description:
        "Your browser may have limitations for background notifications.",
      steps: [
        "Keep your browser running (minimized is OK)",
        "Check browser notification settings",
        "Consider using a different browser for better support",
      ],
      limitation: true,
    }
  }

  const instructions = getInstructions()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Info className="h-4 w-4 mr-2" />
          Notification Help
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getBrowserIcon()}
            {instructions.title}
          </DialogTitle>
          <DialogDescription>{instructions.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {instructions.limitation && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  Browser Limitation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700">
                  {browser === "chrome" || browser === "edge"
                    ? "Chrome and Edge on macOS have limitations with background notifications. Even with the setting enabled, notifications may not always work when the browser is completely closed."
                    : "Your browser may not support background notifications when completely closed."}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-blue-800">
                Alternative Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Keep browser minimized instead of closing it
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Use Safari on macOS for better notification support
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Check notifications regularly in the app
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
