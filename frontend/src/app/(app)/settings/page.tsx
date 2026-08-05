"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import api from "@/api/client"
import { getApiErrorMessage } from "@/lib/api-error"
import { useWorkspaceSession } from "@/lib/use-workspace-session"

export default function SettingsPage() {
  const session = useWorkspaceSession()

  const [repoUrl, setRepoUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (session.user) {
      setRepoUrl(session.user.github_repo ?? "")
    }
  }, [session.user])

  async function handleSaveRepo() {
    setError(null)
    setSuccess(null)
    setIsSaving(true)

    try {
      await api.post("/set-repo", {
        repo_url: repoUrl,
      })

      setSuccess("Repository updated successfully.")
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save repository."))
    } finally {
      setIsSaving(false)
    }
  }

  if (session.isCheckingSession) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        Loading...
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <section>
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Settings
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Workspace Settings
        </h1>

        <p className="mt-3 text-muted-foreground">
          Manage your connected GitHub repository.
        </p>
      </section>

      <div className="rounded-3xl border p-6 space-y-5">
        <Input
          placeholder="https://github.com/username/repository.git"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          disabled={isSaving}
        />

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-600">
            {success}
          </p>
        )}

        <Button
          onClick={handleSaveRepo}
          disabled={isSaving || repoUrl.trim() === ""}
        >
          {isSaving ? "Saving..." : "Save Repository"}
        </Button>
      </div>
    </main>
  )
}