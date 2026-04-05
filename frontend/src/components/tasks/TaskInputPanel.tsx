"use client"

import { useState } from "react"
import { Plus, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCreateTasks } from "../../features/tasks/hooks"

const quickIdeas = ["deep work sprint", "revise dsa", "ship api polish"]

export default function TaskInputPanel() {
  const [input, setInput] = useState("")
  const createTask = useCreateTasks()

  const handleSubmit = () => {
    if (!input.trim()) {
      return
    }

    createTask.mutate(input, {
      onSuccess: () => setInput(""),
    })
  }

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-background/55 p-4 backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Zap className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary" />
          <Input
            placeholder="Try: gym, revise dsa, polish dashboard"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSubmit()
              }
            }}
            className="h-[52px] rounded-full border-white/10 bg-background/55 pl-11 text-sm"
          />
        </div>

        <Button
          onClick={handleSubmit}
          size="lg"
          className="h-[52px] rounded-full px-6"
          disabled={createTask.isPending}
        >
          <Plus className="size-4" />
          {createTask.isPending ? "Adding..." : "Add tasks"}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickIdeas.map((idea) => (
          <button
            key={idea}
            type="button"
            className="rounded-full border border-white/10 bg-background/45 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-background/70 hover:text-foreground"
            onClick={() => setInput((current) => (current ? `${current}, ${idea}` : idea))}
          >
            {idea}
          </button>
        ))}
      </div>

      {createTask.isError ? (
        <p className="mt-3 text-sm text-destructive">Could not create tasks. Try again.</p>
      ) : null}
    </div>
  )
}
