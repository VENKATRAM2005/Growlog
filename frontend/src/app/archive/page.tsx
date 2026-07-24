"use client"

import Link from "next/link"
import { ExternalLink, FileText, Github, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import DashboardLayout from "../../components/layout/DashboardLayout"
import { MetricCard } from "../../components/shared/MetricCard"
import { PageHeader } from "../../components/shared/PageHeader"
import { ErrorState, LoadingState } from "../../components/shared/PageState"
import { useMonthlyAnalytics, useWeeklyAnalytics } from "../../features/analytics/hooks"
import { useWorkspaceSession } from "../../lib/use-workspace-session"

export default function ArchivePage() {
  const session = useWorkspaceSession()
  const weeklyAnalytics = useWeeklyAnalytics()
  const monthlyAnalytics = useMonthlyAnalytics()

  if (!session.token || session.isCheckingSession) {
    return (
      <div className="px-3 py-3 md:px-4 md:py-4">
        <LoadingState title="Loading Archive" description="Checking repo sync and the current proof-of-progress layer." />
      </div>
    )
  }

  if (!session.user) {
    return null
  }

  if (weeklyAnalytics.isError || monthlyAnalytics.isError) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Archive view could not load"
          description="We couldn't gather enough state for the archive and sync experience."
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </DashboardLayout>
    )
  }

  const weekly = weeklyAnalytics.data
  const monthly = monthlyAnalytics.data
  const weeklyTotal = weekly?.completed_counts.reduce((sum, count) => sum + count, 0) ?? 0
  const monthlyTotal = monthly?.completed_counts.reduce((sum, count) => sum + count, 0) ?? 0

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          eyebrow="Proof of progress"
          title="Archive"
          description="This is where the work becomes narratable: logs, repository sync, and visible receipts for what actually moved."
          actions={
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-background/55 px-5">
              <Link href="/setup-repo">Manage repo sync</Link>
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Sync status" value={session.user.github_repo ? "Connected" : "Not connected"} caption={session.user.github_repo ? "Growlog can update your archive remote." : "Connect a GitHub repo to turn progress into artifacts."} icon={ShieldCheck} />
          <MetricCard title="Weekly artifacts" value={weeklyTotal} caption="Completed tasks in the active weekly window." icon={FileText} accent="chart" />
          <MetricCard title="Monthly artifacts" value={monthlyTotal} caption="Completed tasks contributing to the current monthly archive." icon={Github} accent="warm" />
          <MetricCard title="Current month" value={monthly?.month ?? "--"} caption="The archive window currently being assembled by the system." icon={FileText} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="section-shell border-white/10 bg-background/50">
            <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Repository sync</div>
            <h2 className="mt-2 text-2xl font-semibold">Archive destination</h2>
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-background/55 p-5">
              {session.user.github_repo ? (
                <>
                  <div className="text-sm text-muted-foreground">Connected repository</div>
                  <div className="mt-2 break-all font-medium">{session.user.github_repo}</div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button asChild className="rounded-full px-5">
                      <a href={session.user.github_repo.replace(/\.git$/, "")} target="_blank" rel="noreferrer">
                        Open repository
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full border-white/10 px-5">
                      <Link href="/settings">Update sync settings</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">No repository connected yet</div>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Connect a dedicated GitHub repo so daily and monthly logs become visible, portable proof instead of hidden internal state.
                  </p>
                  <Button asChild className="mt-5 rounded-full px-5">
                    <Link href="/setup-repo">Connect repository</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="section-shell border-white/10 bg-background/50">
            <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Why it matters</div>
            <h2 className="mt-2 text-2xl font-semibold">A stronger narrative layer</h2>
            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5 text-sm leading-6">
                Daily logs make invisible effort reviewable.
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5 text-sm leading-6">
                Monthly logs turn consistency into something you can point to during demos, interviews, and self-review.
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5 text-sm leading-6">
                Git-backed progress creates trust. It is harder to lie to yourself when the work has receipts.
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
