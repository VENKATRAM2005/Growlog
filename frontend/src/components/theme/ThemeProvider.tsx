"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  mounted: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.dataset.theme = theme
  localStorage.setItem("growlog-theme", theme)
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [theme, setThemeState] = useState<Theme>("dark")

  useEffect(() => {
    const stored = localStorage.getItem("growlog-theme")

    const initialTheme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"

    setThemeState(initialTheme)
    applyTheme(initialTheme)
    setMounted(true)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      mounted,
      setTheme(nextTheme: Theme) {
        setThemeState(nextTheme)
        applyTheme(nextTheme)
      },
      toggleTheme() {
        const next = theme === "dark" ? "light" : "dark"
        setThemeState(next)
        applyTheme(next)
      },
    }),
    [theme, mounted]
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