"use client"

import { CheckCheck } from "lucide-react"

import AppSurface from "../shared/AppSurface"
import { useCompletedTasks } from "../../features/tasks/hooks"

export default function CompletedTaskList() {
  const { data: tasks, isLoading } = useCompletedTasks()

  return (
    <AppSurface>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Wins</div>
          <h2 className="mt-2 text-2xl font-semibold">Completed tasks</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-background/55 px-3 py-1 text-sm text-muted-foreground">
          {tasks?.length ?? 0} finished
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5 text-sm text-muted-foreground">
            Loading wins...
          </div>
        ) : tasks?.length ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-gradient-to-r from-primary/8 to-chart-2/8 p-4"
            >
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <CheckCheck className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="font-medium line-through opacity-80">{task.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Closed {task.completed_at ? new Date(task.completed_at).toLocaleString() : "recently"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-background/45 p-6">
            <div className="text-lg font-medium">No wins logged yet.</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Finish your first task to start the visible momentum trail.
            </p>
          </div>
        )}
      </div>
    </AppSurface>
  )
}
