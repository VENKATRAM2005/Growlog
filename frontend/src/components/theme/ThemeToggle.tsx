"use client"

import { MoonStar, SunMedium } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "./ThemeProvider"

export default function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme()

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className="rounded-full border-white/10 bg-background/55 backdrop-blur-xl"
      >
        <div className="size-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full border-white/10 bg-background/55 backdrop-blur-xl"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunMedium className="size-4" />
      ) : (
        <MoonStar className="size-4" />
      )}
    </Button>
  )
}