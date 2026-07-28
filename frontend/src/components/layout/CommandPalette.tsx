"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Command, FileText, ListTodo, Plus, Search, Settings2, TimerReset } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCreateTasks } from "../../features/tasks/hooks"

type PaletteAction = {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  onSelect: () => void
}

export default function CommandPalette() {
  const router = useRouter()
  const pathname = usePathname()
  const createTask = useCreateTasks()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [composeMode, setComposeMode] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    const handleOpenRequest = () => {
      setOpen(true)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("growlog:open-command-palette", handleOpenRequest as EventListener)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("growlog:open-command-palette", handleOpenRequest as EventListener)
    }
  }, [])

const navigateAndClose = useCallback(
  (href: string) => {
    router.push(href)
    setOpen(false)
    setComposeMode(false)
    setQuery("")
  },
  [router]
)

  const actions = useMemo<PaletteAction[]>(
    () => [
      {
        id: "today",
        label: "Go to Today",
        description: "Open your focus view and daily momentum widgets.",
        icon: TimerReset,
        onSelect: () => navigateAndClose("/today"),
      },
      {
        id: "tasks",
        label: "Go to Tasks",
        description: "Review open work, completed wins, and queue health.",
        icon: ListTodo,
        onSelect: () => navigateAndClose("/tasks"),
      },
      {
        id: "analytics",
        label: "Go to Analytics",
        description: "Inspect weekly and monthly execution trends.",
        icon: BarChart3,
        onSelect: () => navigateAndClose("/analytics"),
      },
      {
        id: "archive",
        label: "Go to Archive",
        description: "Review repo sync status and your proof-of-progress layer.",
        icon: FileText,
        onSelect: () => navigateAndClose("/archive"),
      },
      {
        id: "settings",
        label: "Go to Settings",
        description: "Adjust workspace, sync, and appearance preferences.",
        icon: Settings2,
        onSelect: () => navigateAndClose("/settings"),
      },
      {
        id: "capture",
        label: "Quick capture tasks",
        description: "Paste comma or newline separated tasks from anywhere.",
        icon: Plus,
        onSelect: () => {
          setComposeMode(true)
          setQuery("")
        },
      },
    ],
    [navigateAndClose]
  )

  const filteredActions = actions.filter((action) => {
    if (!query.trim() || composeMode) {
      return true
    }

    const haystack = `${action.label} ${action.description}`.toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  })

  const submitQuickCapture = () => {
    if (!query.trim()) {
      return
    }

    createTask.mutate(query, {
      onSuccess: () => {
        setOpen(false)
        setComposeMode(false)
        setQuery("")
        if (pathname !== "/tasks") {
          router.push("/tasks")
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen)
      if (!nextOpen) {
        setComposeMode(false)
        setQuery("")
      }
    }}>
      <DialogContent className="max-w-2xl rounded-[2rem] border-white/10 bg-background/96 p-0 shadow-2xl" showCloseButton={false}>
        <DialogHeader className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-left text-xl">Command palette</DialogTitle>
              <DialogDescription className="mt-1 text-left">
                Jump anywhere, capture tasks fast, and keep the workspace feeling instant.
              </DialogDescription>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-background/60 px-3 py-1 text-xs text-muted-foreground sm:block">
              Ctrl/Cmd + K
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && composeMode) {
                  event.preventDefault()
                  submitQuickCapture()
                }
              }}
              placeholder={composeMode ? "Try: ship docs, review analytics, polish dashboard" : "Search pages and actions"}
              className="h-12 rounded-full border-white/10 bg-background/60 pl-11"
            />
          </div>
        </div>

        {composeMode ? (
          <div className="px-5 pb-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-background/55 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Quick capture</div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Drop messy input here. Growlog will normalize, deduplicate, and file it into your queue.
                  </p>
                </div>
                <Command className="size-5 text-primary" />
              </div>
              {createTask.isError ? (
                <p className="mt-4 text-sm text-destructive">Could not create tasks. Try again.</p>
              ) : null}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button className="rounded-full px-5" onClick={submitQuickCapture} disabled={createTask.isPending || !query.trim()}>
                  {createTask.isPending ? "Adding..." : "Add tasks"}
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full px-5"
                  onClick={() => {
                    setComposeMode(false)
                    setQuery("")
                  }}
                >
                  Back to actions
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-2 px-3 pb-3">
            {filteredActions.map(({ id, label, description, icon: Icon, onSelect }) => (
              <button
                key={id}
                type="button"
                onClick={onSelect}
                className="flex w-full items-start gap-4 rounded-[1.25rem] px-4 py-3 text-left transition hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="size-4" />
                </div>
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="mt-1 text-sm leading-6 text-muted-foreground">{description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
