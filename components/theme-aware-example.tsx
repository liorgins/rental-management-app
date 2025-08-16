"use client"

import { useTheme } from "@/lib/theme-provider"

/**
 * Example component showing how to use theme in components
 * This is just for demonstration - can be deleted if not needed
 */
export function ThemeAwareExample() {
  const { theme } = useTheme()

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold">Theme Status</h3>
      <p className="text-sm text-muted-foreground">
        Current theme: <span className="font-medium">{theme}</span>
      </p>
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-background border" />
          <span>Background color adapts to theme</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-foreground" />
          <span>Foreground color adapts to theme</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span>Primary color stays consistent</span>
        </div>
      </div>
    </div>
  )
}
