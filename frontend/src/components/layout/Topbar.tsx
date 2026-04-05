"use client"

import { usePathname } from "next/navigation"
import { Bell, Flame, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const titles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Execution cockpit",
    subtitle: "Turn intent into visible momentum.",
  },
  "/settings": {
    title: "Workspace settings",
    subtitle: "Control how your progress gets archived.",
  },
  "/setup-repo": {
    title: "Repository sync",
    subtitle: "Connect your proof-of-progress pipeline.",
  },
}

export default function Topbar() {
  const pathname = usePathname()
  const content = titles[pathname] ?? {
    title: "Growlog",
    subtitle: "Stay in motion.",
  }

  return (
    <header className="glass-panel flex flex-col gap-4 rounded-[2rem] border-white/10 bg-background/55 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Flame className="size-3.5 text-primary" />
          Momentum layer
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{content.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{content.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-[240px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search momentum, tasks, or insights"
            className="h-11 rounded-full border-white/10 bg-background/55 pl-10"
          />
        </div>
        <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-background/55">
          <Bell className="size-4" />
        </Button>
      </div>
    </header>
  )
}
