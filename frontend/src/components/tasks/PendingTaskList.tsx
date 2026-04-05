"use client"

import { CircleDot, LoaderCircle } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import AppSurface from "../shared/AppSurface"
import { useCompleteTask, usePendingTasks } from "../../features/tasks/hooks"

export default function PendingTaskList() {
  const { data: tasks, isLoading } = usePendingTasks()
  const completeTask = useCompleteTask()

  return (
    <AppSurface>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Queue</div>
          <h2 className="mt-2 text-2xl font-semibold">Pending tasks</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-background/55 px-3 py-1 text-sm text-muted-foreground">
          {tasks?.length ?? 0} open
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5 text-sm text-muted-foreground">
            Loading tasks...
          </div>
        ) : tasks?.length ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-background/55 p-4 transition hover:-translate-y-0.5 hover:bg-background/70"
            >
              <Checkbox
                onCheckedChange={() => completeTask.mutate(task.id)}
                disabled={completeTask.isPending}
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{task.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Created {new Date(task.created_at).toLocaleString()}
                </div>
              </div>
              {completeTask.isPending ? (
                <LoaderCircle className="size-4 animate-spin text-primary" />
              ) : (
                <CircleDot className="size-4 text-primary" />
              )}
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-background/45 p-6">
            <div className="text-lg font-medium">Inbox clear.</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Add one meaningful task and keep the momentum alive.
            </p>
          </div>
        )}
      </div>
    </AppSurface>
  )
}
