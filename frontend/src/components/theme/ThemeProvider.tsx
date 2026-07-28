"use client"

import { createContext, useContext, useMemo, useState } from "react"

type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  mounted: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark"
  }

  const stored = localStorage.getItem("growlog-theme")

  if (stored === "light" || stored === "dark") {
    return stored
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return

  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.dataset.theme = theme
  localStorage.setItem("growlog-theme", theme)
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const initial = getInitialTheme()
    applyTheme(initial)
    return initial
  })

  const value = useMemo(
    () => ({
      theme,
      mounted: true,
      setTheme(nextTheme: Theme) {
        applyTheme(nextTheme)
        setThemeState(nextTheme)
      },
      toggleTheme() {
        setThemeState((current) => {
          const next = current === "dark" ? "light" : "dark"
          applyTheme(next)
          return next
        })
      },
    }),
    [theme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}