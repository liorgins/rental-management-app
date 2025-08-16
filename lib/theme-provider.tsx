"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "rental-app-theme",
  attribute: _attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if we're on the client
    if (typeof window === "undefined") {
      return defaultTheme
    }

    // Try to get theme from localStorage
    try {
      const stored = localStorage.getItem(storageKey)
      if (
        stored &&
        (stored === "dark" || stored === "light" || stored === "system")
      ) {
        return stored as Theme
      }
    } catch (error) {
      // localStorage might not be available
      console.warn("Failed to read theme from localStorage:", error)
    }

    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme, enableSystem])

  useEffect(() => {
    // Listen for system theme changes
    if (!enableSystem) return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(mediaQuery.matches ? "dark" : "light")
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, enableSystem])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // Disable transitions temporarily if requested
      if (disableTransitionOnChange) {
        document.documentElement.style.setProperty("transition", "none")
        requestAnimationFrame(() => {
          document.documentElement.style.removeProperty("transition")
        })
      }

      try {
        localStorage.setItem(storageKey, theme)
      } catch (error) {
        // localStorage might not be available
        console.warn("Failed to save theme to localStorage:", error)
      }

      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
