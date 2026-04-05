"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Github, LayoutDashboard, LogOut, Settings2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { clearToken } from "../../lib/auth"
import ThemeToggle from "../theme/ThemeToggle"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Workspace", icon: Settings2 },
  { href: "/setup-repo", label: "Repo Sync", icon: Github },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="glass-panel flex h-full flex-col rounded-[2rem] border-white/10 bg-sidebar/70 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Growlog
          </div>
          <div className="mt-2 text-2xl font-semibold">Builder OS</div>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-background/50 p-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          Momentum mode
        </div>
        <div className="mt-4 text-3xl font-semibold">87</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Focus score based on your recent completion rhythm and backlog pressure.
        </p>
        <div className="mt-5 h-2 rounded-full bg-muted">
          <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-primary via-chart-2 to-chart-4" />
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-transparent text-muted-foreground hover:bg-background/55 hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />
              <span className="font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-background/50 p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BarChart3 className="size-4 text-primary" />
          This week
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-background/65 p-4">
            <div className="text-muted-foreground">Completed</div>
            <div className="mt-2 text-2xl font-semibold">12</div>
          </div>
          <div className="rounded-2xl bg-background/65 p-4">
            <div className="text-muted-foreground">Streak</div>
            <div className="mt-2 text-2xl font-semibold">11d</div>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        className="mt-auto justify-start rounded-2xl px-4 py-6 text-muted-foreground hover:bg-background/55 hover:text-foreground"
        onClick={() => {
          clearToken()
          router.replace("/login")
        }}
      >
        <LogOut className="size-4" />
        Log out
      </Button>
    </aside>
  )
}
