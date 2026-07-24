"use client"

import { TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import AppSurface from "../shared/AppSurface"
import { ErrorState, LoadingState } from "../shared/PageState"
import { useWeeklyAnalytics } from "../../features/analytics/hooks"

export default function WeeklyActivityGraph() {
  const { data, isLoading, isError, error } = useWeeklyAnalytics()

  if (isLoading) {
    return (
      <AppSurface>
        <LoadingState
          className="min-h-[320px] border-none bg-transparent px-0 py-0"
          title="Loading weekly activity"
          description="Pulling the latest seven-day close pattern."
        />
      </AppSurface>
    )
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status
    return (
      <AppSurface>
        <ErrorState
          className="min-h-[320px] border-none bg-transparent px-0 py-0"
          title={status === 401 ? "Sign in required" : "Weekly activity unavailable"}
          description={
            status === 401
              ? "Please sign in again to see your activity data."
              : "We couldn't load the weekly activity graph right now."
          }
        />
      </AppSurface>
    )
  }

  const chartData =
    data?.days.map((day, idx) => ({
      day: new Date(day).toLocaleDateString(undefined, { weekday: "short" }),
      completed: data.completed_counts[idx] ?? 0,
    })) ?? []

  const total = chartData.reduce((sum, item) => sum + item.completed, 0)

  return (
    <AppSurface>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Trend</div>
          <h2 className="mt-2 text-2xl font-semibold">Weekly activity</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/55 px-3 py-1 text-sm text-muted-foreground">
          <TrendingUp className="size-4 text-primary" />
          {total} closes this week
        </div>
      </div>

      <div className="mt-6 h-[320px] w-full rounded-[1.75rem] border border-white/10 bg-background/40 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="4 4" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
              }}
            />
            <Bar dataKey="completed" fill="var(--color-chart-1)" radius={[18, 18, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AppSurface>
  )
}
