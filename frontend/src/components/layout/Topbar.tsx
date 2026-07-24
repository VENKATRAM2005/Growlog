"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Command, Flame, Plus, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateTasks } from "@/features/tasks/hooks"

const titles: Record<string, { title: string; subtitle: string }> = {
  "/today": {
    title: "Today",
    subtitle: "Focus the queue, move work forward, and make progress visible.",
  },
  "/tasks": {
    title: "Tasks",
    subtitle: "A clear view of what is open, what is done, and what needs attention.",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Track output quality, rhythm, and the health of your execution system.",
  },
  "/archive": {
    title: "Archive",
    subtitle: "Your proof-of-progress layer, backed by logs and sync visibility.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Shape the workspace, sync behavior, and system preferences.",
  },
  "/setup-repo": {
    title: "Repository sync",
    subtitle: "Connect your proof-of-progress pipeline.",
  },
}

export default function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const createTask = useCreateTasks()
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [quickAddValue, setQuickAddValue] = useState("")
  const content = titles[pathname] ?? {
    title: "Growlog",
    subtitle: "Stay in motion.",
  }

  const handleQuickAdd = () => {
    if (!quickAddValue.trim()) {
      return
    }

    createTask.mutate(quickAddValue, {
      onSuccess: () => {
        setQuickAddValue("")
        setIsQuickAddOpen(false)
        if (pathname !== "/tasks") {
          router.push("/tasks")
        }
      },
    })
  }

  return (
    <>
    <header className="glass-panel flex flex-col gap-4 rounded-[2rem] border-white/10 bg-background/55 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Flame className="size-3.5 text-primary" />
          Momentum layer
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{content.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{content.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          className="group flex min-w-[240px] items-center gap-3 rounded-full border border-white/10 bg-background/55 px-4 py-3 text-left text-sm text-muted-foreground transition hover:bg-background/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => window.dispatchEvent(new CustomEvent("growlog:open-command-palette"))}
        >
          <Search className="size-4 text-muted-foreground transition group-hover:text-foreground" />
          <span className="flex-1">Search or jump anywhere</span>
          <span className="hidden rounded-full border border-white/10 px-2 py-0.5 text-xs sm:inline-flex">Ctrl/Cmd + K</span>
        </button>
        <Button variant="outline" className="rounded-full border-white/10 bg-background/55 px-4" onClick={() => setIsQuickAddOpen(true)}>
          <Plus className="size-4" />
          Quick add
        </Button>
      </div>
    </header>
    <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
      <DialogContent className="rounded-[2rem] border-white/10 bg-background/96">
        <DialogHeader>
          <DialogTitle>Add tasks quickly</DialogTitle>
          <DialogDescription>
            Paste a comma or newline separated list. Growlog will normalize and file it into your queue.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Command className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={quickAddValue}
              onChange={(event) => setQuickAddValue(event.target.value)}
              placeholder="ship docs, clean backlog, review metrics"
              className="h-12 rounded-full border-white/10 bg-background/60 pl-11"
            />
          </div>
          {createTask.isError ? (
            <p className="text-sm text-destructive">Could not create tasks. Try again.</p>
          ) : null}
          <div className="flex gap-3">
            <Button className="rounded-full px-5" onClick={handleQuickAdd} disabled={createTask.isPending || !quickAddValue.trim()}>
              {createTask.isPending ? "Adding..." : "Add tasks"}
            </Button>
            <Button variant="ghost" className="rounded-full px-5" onClick={() => setIsQuickAddOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
