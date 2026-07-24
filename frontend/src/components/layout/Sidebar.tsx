"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, FileText, ListTodo, LogOut, Settings2, Sparkles, TimerReset } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCompletedTasks, usePendingTasks } from "../../features/tasks/hooks"
import { useMonthlyAnalytics, useWeeklyAnalytics } from "../../features/analytics/hooks"
import { clearToken } from "../../lib/auth"
import { calculateMomentumScore, calculateStreak } from "../../lib/product-metrics"
import ThemeToggle from "../theme/ThemeToggle"

const navItems = [
  { href: "/today", label: "Today", icon: TimerReset },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/archive", label: "Archive", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings2 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: pendingTasks } = usePendingTasks()
  const { data: completedTasks } = useCompletedTasks()
  const { data: weeklyAnalytics } = useWeeklyAnalytics()
  const { data: monthlyAnalytics } = useMonthlyAnalytics()

  const momentumScore = calculateMomentumScore({
    weekly: weeklyAnalytics,
    completedTasks,
    pendingTasks,
  })
  const streak = calculateStreak(weeklyAnalytics, monthlyAnalytics)
  const weeklyCompleted = weeklyAnalytics?.completed_counts.reduce((sum, count) => sum + count, 0) ?? 0

  return (
    <aside className="glass-panel hidden h-full flex-col rounded-[2rem] border-white/10 bg-sidebar/70 p-5 xl:flex">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Growlog
          </div>
          <div className="mt-2 text-2xl font-semibold">Momentum OS</div>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-background/50 p-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          Momentum mode
        </div>
        <div className="mt-4 text-3xl font-semibold">{momentumScore}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          A live score built from completion pace, backlog pressure, and consistency.
        </p>
        <div className="mt-5 h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-chart-2 to-chart-4"
            style={{ width: `${Math.max(12, momentumScore)}%` }}
          />
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
            <div className="mt-2 text-2xl font-semibold">{weeklyCompleted}</div>
          </div>
          <div className="rounded-2xl bg-background/65 p-4">
            <div className="text-muted-foreground">Streak</div>
            <div className="mt-2 text-2xl font-semibold">{streak}d</div>
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
