"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Github, Palette, Save, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "../../api/client"
import DashboardLayout from "../../components/layout/DashboardLayout"
import { PageHeader } from "../../components/shared/PageHeader"
import AppSurface from "../../components/shared/AppSurface"
import { ErrorState, LoadingState } from "../../components/shared/PageState"
import { getApiErrorMessage } from "../../lib/api-error"
import { useWorkspaceSession } from "../../lib/use-workspace-session"

export default function SettingsPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [repoUrl, setRepoUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const session = useWorkspaceSession()

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
      await api.post("/set-repo", { repo_url: repoUrl })
      setSuccess("Repository updated successfully.")
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to save repository"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!session.token || session.isCheckingSession) {
    return (
      <div className="px-3 py-3 md:px-4 md:py-4">
        <LoadingState title="Loading Settings" description="Checking your workspace configuration and sync state." />
      </div>
    )
  }

  if (!session.user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          eyebrow="Workspace controls"
          title="Settings"
          description="Keep your workspace calm, connected, and easy to trust."
        />

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <AppSurface>
          <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Workspace</div>
          <h2 className="mt-2 text-3xl font-semibold">Control your archive pipeline</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Your connected repository is where daily and monthly logs become visible proof of consistency.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-[1.75rem] border border-white/10 bg-background/55 p-5">
              <div className="text-sm text-muted-foreground">Current mode</div>
              <div className="mt-2 flex items-center gap-2 text-xl font-semibold">
                <ShieldCheck className="size-5 text-primary" />
                Git-backed progress archive
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-background/55 p-5">
              <div className="text-sm text-muted-foreground">Why it matters</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Strong projects are not just built. They are documented, reviewable, and easy to narrate.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-background/55 p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Palette className="size-4 text-primary" />
                Appearance
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Theme controls stay in the shell so you can switch visual context from anywhere without disrupting flow.
              </p>
            </div>
          </div>
        </AppSurface>

        <AppSurface>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Github className="size-5" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Repository URL</div>
              <div className="text-2xl font-semibold">Update connected repo</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {session.user.github_repo ? (
              <>
                <Input
                  aria-label="GitHub repository URL"
                  placeholder="https://github.com/user/growlog-archive.git"
                  value={repoUrl}
                  onChange={(event) => setRepoUrl(event.target.value)}
                  disabled={isSaving}
                  className="h-12 rounded-2xl border-white/10 bg-background/55"
                />

                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                {success ? <p className="text-sm text-primary">{success}</p> : null}

                <Button className="h-12 rounded-2xl px-5" onClick={handleSaveRepo} disabled={isSaving || !repoUrl.trim()}>
                  <Save className="size-4" />
                  {isSaving ? "Saving..." : "Save repository"}
                </Button>
              </>
            ) : (
              <ErrorState
                className="min-h-[220px]"
                title="No archive repository connected"
                description="Connect a GitHub repo first so settings can manage your proof-of-progress destination."
                actionLabel="Open repo setup"
                onAction={() => {
                  router.push("/setup-repo")
                }}
              />
            )}
          </div>
        </AppSurface>
      </div>
      </div>
    </DashboardLayout>
  )
}
