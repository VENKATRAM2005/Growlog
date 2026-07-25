"use client"

import { ArrowUpRight, CheckCircle2, ListTodo, Sparkles, Target } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import WeeklyActivityGraph from "../../components/analytics/WeeklyActivityGraph"
import DashboardLayout from "../../components/layout/DashboardLayout"
import { MetricCard } from "../../components/shared/MetricCard"
import { PageHeader } from "../../components/shared/PageHeader"
import { EmptyState, ErrorState, LoadingState } from "../../components/shared/PageState"
import { SkeletonCard } from "../../components/shared/SkeletonCard"
import TaskInputPanel from "../../components/tasks/TaskInputPanel"
import { useMonthlyAnalytics, useWeeklyAnalytics } from "../../features/analytics/hooks"
import { useCompletedTasks, usePendingTasks } from "../../features/tasks/hooks"
import { calculateCompletionRate, calculateMomentumScore, calculateStreak, getPeakDay } from "../../lib/product-metrics"
import { useWorkspaceSession } from "../../lib/use-workspace-session"

export default function TodayPage() {
  const session = useWorkspaceSession({
  requireRepo: false,
  })
  const pendingTasks = usePendingTasks()
  const completedTasks = useCompletedTasks()
  const weeklyAnalytics = useWeeklyAnalytics()
  const monthlyAnalytics = useMonthlyAnalytics()

if (!session.token || session.isCheckingSession) {
  return (
    <div className="px-3 py-3 md:px-4 md:py-4">
      <LoadingState
        title="Loading Today"
        description="Checking your session and preparing your focus view."
      />
    </div>
  )
}

  if (!session.user) {
    return null
  }

  const hasFatalError =
    pendingTasks.isError || completedTasks.isError || weeklyAnalytics.isError || monthlyAnalytics.isError

  if (hasFatalError) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Today could not load"
          description="We couldn't assemble your focus view right now. Try refreshing to pull the latest tasks and analytics."
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </DashboardLayout>
    )
  }

  const pending = pendingTasks.data ?? []
  const completed = completedTasks.data ?? []
  const weekly = weeklyAnalytics.data
  const monthly = monthlyAnalytics.data
  const momentumScore = calculateMomentumScore({ weekly, completedTasks: completed, pendingTasks: pending })
  const streak = calculateStreak(weekly, monthly)
  const completionRate = calculateCompletionRate(completed, pending)
  const peakDay = getPeakDay(weekly)
  const weeklyTotal = weekly?.completed_counts.reduce((sum, current) => sum + current, 0) ?? 0

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          eyebrow={`Welcome back, ${session.user.username}`}
          title="Today"
          description="Keep the queue sharp, finish meaningful work, and let the system make your momentum visible."
          actions={
            <>
              <Button asChild variant="outline" className="rounded-full border-white/10 bg-background/55 px-5">
                <Link href="/tasks">Open full task queue</Link>
              </Button>
              <Button asChild className="rounded-full px-5">
                <Link href="/analytics">Review analytics</Link>
              </Button>
            </>
          }
        />

        {!session.user.github_repo && (
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                   Connect GitHub later
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Growlog works perfectly without GitHub. Connect a repository anytime
                  to generate proof-of-progress logs and archive completed work.
                </p>
              </div>

              <Button asChild className="rounded-full">
                <Link href="/setup-repo">
                  Connect GitHub
                </Link>
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="section-shell hero-glow border-white/10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/60 px-4 py-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              Focus the next close, not the whole mountain
            </div>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] md:text-5xl">
              Capture fast. Finish clean. Let the system prove you are moving.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Your best workday feels calm, not noisy. Add what matters, trim what doesn't, and make each close visible.
            </p>
            <div className="mt-6">
              <TaskInputPanel />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            {(pendingTasks.isLoading || completedTasks.isLoading || weeklyAnalytics.isLoading || monthlyAnalytics.isLoading) ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <MetricCard
                  title="Momentum score"
                  value={momentumScore}
                  caption="A live read on completion pace, consistency, and backlog pressure."
                  icon={ArrowUpRight}
                />
                <MetricCard
                  title="Current streak"
                  value={`${streak}d`}
                  caption={streak > 0 ? "Keep one meaningful close alive each day." : "Finish one task today to start the streak."}
                  icon={Target}
                  accent="warm"
                />
                <MetricCard
                  title="Completion rate"
                  value={`${completionRate}%`}
                  caption={`${completed.length} finished vs ${pending.length} still open in the current queue.`}
                  icon={CheckCircle2}
                  accent="chart"
                />
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Open queue"
            value={pending.length}
            caption={pending.length <= 3 ? "Healthy. Enough pressure to stay honest." : "Trim or finish before you keep expanding."}
            icon={ListTodo}
          />
          <MetricCard
            title="Closed this week"
            value={weeklyTotal}
            caption="Momentum compounds when the week has visible closes."
            icon={CheckCircle2}
            accent="chart"
          />
          <MetricCard
            title="Peak day"
            value={peakDay ? `${peakDay.count}` : "0"}
            caption={peakDay ? `${peakDay.label} carried your highest close count.` : "No strong peak yet in the active window."}
            icon={Sparkles}
            accent="warm"
          />
          <MetricCard
            title="Archive status"
            value={session.user.github_repo ? "Live" : "Off"}
            caption={session.user.github_repo ? "Your proof-of-progress layer is connected." : "Connect a repo to turn progress into artifacts."}
            icon={ArrowUpRight}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <WeeklyActivityGraph />
          <div className="section-shell border-white/10 bg-background/50">
            <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Coach note</div>
            <h2 className="mt-2 text-2xl font-semibold">What matters now</h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5">
                <div className="text-sm text-muted-foreground">Queue health</div>
                <p className="mt-2 text-sm leading-6">
                  {pending.length > 5
                    ? "Your queue is getting heavy. Close one meaningful task before expanding it again."
                    : "Your queue is under control. Keep the next close obvious and easy to start."}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5">
                <div className="text-sm text-muted-foreground">Execution rhythm</div>
                <p className="mt-2 text-sm leading-6">
                  {weeklyTotal > 0
                    ? `You already have ${weeklyTotal} closes in the current weekly window. Protect that rhythm.`
                    : "You do not need a perfect day. You need the first visible win."}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5">
                <div className="text-sm text-muted-foreground">System confidence</div>
                <p className="mt-2 text-sm leading-6">
                  {session.user.github_repo
                    ? "Your repo is connected, so every close can become a narratable artifact."
                    : "Connecting a repo turns momentum into something portable and reviewable."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-shell border-white/10 bg-background/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Today's queue</div>
              <h2 className="mt-2 text-2xl font-semibold">What is immediately in play</h2>
            </div>
            <Button asChild variant="ghost" className="rounded-full px-4">
              <Link href="/tasks">Manage tasks</Link>
            </Button>
          </div>

          {pendingTasks.isLoading ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <SkeletonCard className="min-h-40" />
              <SkeletonCard className="min-h-40" />
            </div>
          ) : pending.length ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {pending.slice(0, 6).map((task) => (
                <div key={task.id} className="rounded-[1.5rem] border border-white/10 bg-background/55 p-4">
                  <div className="font-medium">{task.title}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Created {new Date(task.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-6 min-h-[180px]"
              title="No active work in play"
              description="Add one meaningful task and keep the day light enough to finish strong."
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
