"use client"

import { BarChart3, CalendarDays, Flame, Gauge } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import DashboardLayout from "../../components/layout/DashboardLayout"
import { MetricCard } from "../../components/shared/MetricCard"
import { PageHeader } from "../../components/shared/PageHeader"
import { ErrorState, LoadingState } from "../../components/shared/PageState"
import { useMonthlyAnalytics, useWeeklyAnalytics } from "../../features/analytics/hooks"
import { useCompletedTasks, usePendingTasks } from "../../features/tasks/hooks"
import { calculateCompletionRate, calculateStreak } from "../../lib/product-metrics"
import { useWorkspaceSession } from "../../lib/use-workspace-session"

export default function AnalyticsPage() {
  const session = useWorkspaceSession({ requireRepo: true })
  const weeklyAnalytics = useWeeklyAnalytics()
  const monthlyAnalytics = useMonthlyAnalytics()
  const completedTasks = useCompletedTasks()
  const pendingTasks = usePendingTasks()

  if (!session.token || session.isCheckingSession || session.requiresSetup) {
    return (
      <div className="px-3 py-3 md:px-4 md:py-4">
        <LoadingState title="Loading Analytics" description="Preparing your trend view and execution health signals." />
      </div>
    )
  }

  if (!session.user) {
    return null
  }

  if (weeklyAnalytics.isError || monthlyAnalytics.isError || completedTasks.isError || pendingTasks.isError) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Analytics could not load"
          description="We couldn't pull enough history to build the analytics view right now."
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </DashboardLayout>
    )
  }

  const weekly = weeklyAnalytics.data
  const monthly = monthlyAnalytics.data
  const completed = completedTasks.data ?? []
  const pending = pendingTasks.data ?? []
  const weeklyTotal = weekly?.completed_counts.reduce((sum, count) => sum + count, 0) ?? 0
  const streak = calculateStreak(weekly, monthly)
  const completionRate = calculateCompletionRate(completed, pending)
  const monthlyChartData =
    monthly?.days.map((day, index) => ({
      day: new Date(day).getDate(),
      completed: monthly.completed_counts[index] ?? 0,
    })) ?? []

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          eyebrow="Execution trends"
          title="Analytics"
          description="A clear view of output, consistency, and whether the queue is helping or hurting your pace."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Completed today" value={weekly?.today_completed ?? 0} caption="A visible close is the smallest honest unit of momentum." icon={Flame} />
          <MetricCard title="7-day throughput" value={weeklyTotal} caption="The current weekly window of completed work." icon={BarChart3} accent="chart" />
          <MetricCard title="Queue health" value={pending.length} caption={pending.length <= 3 ? "Healthy queue pressure." : "Queue weight is starting to climb."} icon={Gauge} accent="warm" />
          <MetricCard title="Consistency streak" value={`${streak}d`} caption="Consecutive days with at least one completed task." icon={CalendarDays} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="section-shell border-white/10 bg-background/50">
            <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Monthly trend</div>
            <h2 className="mt-2 text-2xl font-semibold">Daily completions across the month</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Use this to see rhythm, not perfection. The goal is a repeatable pattern of visible closes.
            </p>
            <div className="mt-6 h-[320px] rounded-[1.75rem] border border-white/10 bg-background/45 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="monthlyArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
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
                  <Area type="monotone" dataKey="completed" stroke="var(--color-chart-1)" fill="url(#monthlyArea)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="section-shell border-white/10 bg-background/50">
              <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Signals</div>
              <h2 className="mt-2 text-2xl font-semibold">How the system is behaving</h2>
              <div className="mt-6 grid gap-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5">
                  <div className="text-sm text-muted-foreground">Completion rate</div>
                  <div className="mt-3 text-4xl font-semibold">{completionRate}%</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Based on the current tracked queue of completed and pending tasks.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5">
                  <div className="text-sm text-muted-foreground">Backlog pressure</div>
                  <div className="mt-3 text-4xl font-semibold">{pending.length}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {pending.length > 5
                      ? "The queue is expanding faster than it is closing."
                      : "The queue is still in a range that is easy to narrate and control."}
                  </p>
                </div>
              </div>
            </div>

            <div className="section-shell border-white/10 bg-background/50">
              <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Interpretation</div>
              <h2 className="mt-2 text-2xl font-semibold">What to do next</h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5 text-sm leading-6">
                  {weeklyTotal > 0
                    ? `You have ${weeklyTotal} closes in the current weekly window. Protect the rhythm instead of over-expanding the queue.`
                    : "Your weekly close count is still at zero. Focus on a fast, honest win rather than planning more."}
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5 text-sm leading-6">
                  {streak > 2
                    ? `A ${streak}-day streak is strong evidence that the system is helping. Keep the next task small enough to preserve it.`
                    : "Consistency is still fragile. Keep the next close obvious and easy to start."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
