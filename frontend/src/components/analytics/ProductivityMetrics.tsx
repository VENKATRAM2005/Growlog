"use client"

import { Flame, Gauge, ListTodo, Target } from "lucide-react"

import AppSurface from "../shared/AppSurface"
import { usePendingTasks } from "../../features/tasks/hooks"
import { useDashboardAnalytics } from "../../features/analytics/hooks"

export default function ProductivityMetrics() {
  const { data, isLoading, isError, error } = useDashboardAnalytics()
  const { data: pendingTasks } = usePendingTasks()

  if (isLoading) {
    return <AppSurface className="text-sm text-muted-foreground">Loading your momentum snapshot...</AppSurface>
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status
    return (
      <AppSurface className="text-sm text-muted-foreground">
        {status === 401 ? "Please log in to view analytics." : "Failed to load analytics."}
      </AppSurface>
    )
  }

  const dashboard = data

const todayCompleted = dashboard?.today_completed ?? 0
const pendingCount = dashboard?.pending_count ?? 0
const completedCount = dashboard?.completed_tasks ?? 0
const currentStreak = dashboard?.current_streak ?? 0
  const cards = [
    {
      title: "Completed today",
      value: todayCompleted,
      caption: "Strong closes create trust with yourself.",
      icon: Flame,
    },
    {
      title: "Backlog pressure",
      value: pendingCount,
      caption: pendingCount <= 3 ? "Healthy queue." : "Trim or finish before adding more.",
      icon: ListTodo,
    },
    {
  title: "Completed Tasks",
  value: completedCount,
  caption: "Total tasks completed.",
  icon: Target,
},
{
  title: "Current Streak",
  value: currentStreak,
  caption: "Consecutive days with completed tasks.",
  icon: Gauge,
},
  ]

  return (
    <AppSurface>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Snapshot</div>
          <h2 className="mt-2 text-2xl font-semibold">Momentum at a glance</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cards.map(({ title, value, caption, icon: Icon }) => (
          <div key={title} className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{title}</div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Icon className="size-4" />
              </div>
            </div>
            <div className="mt-4 text-4xl font-semibold">{value}</div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{caption}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-background/45 p-5">
        <div className="text-sm text-muted-foreground">Coach note</div>
        <p className="mt-2 text-base leading-7">
          {pendingTasks && pendingTasks.length > 4
            ? "You have enough in flight. Protect quality by closing one important task before expanding the queue."
            : "Your queue is under control. This is a good moment to keep the pace crisp and stack another clean win."}
        </p>
      </div>
    </AppSurface>
  )
}
