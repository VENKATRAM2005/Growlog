"use client"

import { useState } from "react"
import { CheckCheck, CircleDot, Filter} from "lucide-react"

import { Button } from "@/components/ui/button"
import DashboardLayout from "../../components/layout/DashboardLayout"
import { PageHeader } from "../../components/shared/PageHeader"
import { EmptyState, ErrorState, LoadingState } from "../../components/shared/PageState"
import TaskInputPanel from "../../components/tasks/TaskInputPanel"
import { useCompleteTask, useCompletedTasks, usePendingTasks } from "../../features/tasks/hooks"
import { useWorkspaceSession } from "../../lib/use-workspace-session"

type TaskFilter = "all" | "pending" | "completed"

export default function TasksPage() {
  const session = useWorkspaceSession({ requireRepo: true })
  const [filter, setFilter] = useState<TaskFilter>("all")
  const pendingTasks = usePendingTasks()
  const completedTasks = useCompletedTasks()
  const completeTask = useCompleteTask()

  if (!session.token || session.isCheckingSession || session.requiresSetup) {
    return (
      <div className="px-3 py-3 md:px-4 md:py-4">
        <LoadingState title="Loading Tasks" description="Bringing your queue and recent wins into view." />
      </div>
    )
  }

  if (!session.user) {
    return null
  }

  if (pendingTasks.isError || completedTasks.isError) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Tasks could not load"
          description="We couldn't fetch the latest task state. Refresh and try again."
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </DashboardLayout>
    )
  }

  const pending = pendingTasks.data ?? []
  const completed = completedTasks.data ?? []
  const visibleTasks =
    filter === "pending" ? pending : filter === "completed" ? completed : [...pending, ...completed]
  const sortedTasks = [...visibleTasks].sort((left, right) => {
    const leftDate = left.completed_at ?? left.created_at
    const rightDate = right.completed_at ?? right.created_at
    return new Date(rightDate).getTime() - new Date(leftDate).getTime()
  })

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          eyebrow="Queue management"
          title="Tasks"
          description="One place to capture raw work, clean the queue, and close meaningful tasks without losing the thread."
          actions={
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/55 px-4 py-2 text-sm text-muted-foreground">
              <Filter className="size-4" />
              {pending.length} open · {completed.length} finished
            </div>
          }
        />

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="section-shell border-white/10 bg-background/50">
            <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Quick capture</div>
            <h2 className="mt-2 text-2xl font-semibold">Add work without friction</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Paste a rough list, let Growlog clean it up, and then decide what deserves attention.
            </p>
            <div className="mt-6">
              <TaskInputPanel />
            </div>
          </div>

          <div className="section-shell border-white/10 bg-background/50">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All" },
                { id: "pending", label: "Pending" },
                { id: "completed", label: "Completed" },
              ].map((option) => (
                <Button
                  key={option.id}
                  variant={filter === option.id ? "default" : "outline"}
                  className="rounded-full border-white/10 px-4"
                  onClick={() => setFilter(option.id as TaskFilter)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <div className="mt-6">
              {(pendingTasks.isLoading || completedTasks.isLoading) ? (
                <LoadingState
                  className="min-h-[280px]"
                  title="Loading queue"
                  description="Pulling task state and recent wins."
                />
              ) : sortedTasks.length ? (
                <div className="space-y-3">
                  {sortedTasks.map((task) => {
                    const isCompleted = task.status === "completed"
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-background/55 p-4"
                      >
                        <div className={`mt-1 flex size-10 items-center justify-center rounded-2xl ${isCompleted ? "bg-primary/15 text-primary" : "bg-background/65 text-muted-foreground"}`}>
                          {isCompleted ? <CheckCheck className="size-4" /> : <CircleDot className="size-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-medium ${isCompleted ? "opacity-75 line-through" : ""}`}>{task.title}</div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {isCompleted
                              ? `Closed ${task.completed_at ? new Date(task.completed_at).toLocaleString() : "recently"}`
                              : `Created ${new Date(task.created_at).toLocaleString()}`}
                          </div>
                        </div>
                        {!isCompleted ? (
                          <Button
                            variant="outline"
                            className="rounded-full border-white/10 px-4"
                            disabled={completeTask.isPending}
                            onClick={() => completeTask.mutate(task.id)}
                          >
                            Close
                          </Button>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  className="min-h-[280px]"
                  title="No tasks in this view"
                  description="Clear the filter or add something new to keep momentum alive."
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="section-shell border-white/10 bg-background/50">
            <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Pending stack</div>
            <h2 className="mt-2 text-2xl font-semibold">What still needs attention</h2>
            <div className="mt-6 space-y-3">
              {pending.length ? pending.slice(0, 5).map((task) => (
                <div key={task.id} className="rounded-[1.5rem] border border-white/10 bg-background/55 p-4">
                  <div className="font-medium">{task.title}</div>
                  <div className="mt-2 text-xs text-muted-foreground">Created {new Date(task.created_at).toLocaleString()}</div>
                </div>
              )) : (
                <EmptyState className="min-h-[180px]" title="Inbox clear" description="A light queue is a gift. Add only what you mean to move." />
              )}
            </div>
          </div>

          <div className="section-shell border-white/10 bg-background/50">
            <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Recent wins</div>
            <h2 className="mt-2 text-2xl font-semibold">What you already shipped</h2>
            <div className="mt-6 space-y-3">
              {completed.length ? completed.slice(0, 5).map((task) => (
                <div key={task.id} className="rounded-[1.5rem] border border-white/10 bg-background/55 p-4">
                  <div className="font-medium line-through opacity-80">{task.title}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Closed {task.completed_at ? new Date(task.completed_at).toLocaleString() : "recently"}
                  </div>
                </div>
              )) : (
                <EmptyState className="min-h-[180px]" title="No wins yet" description="Finish one meaningful task to start the visible momentum trail." />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
