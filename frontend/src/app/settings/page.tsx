"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Github, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "../../api/client"
import DashboardLayout from "../../components/layout/DashboardLayout"
import AppSurface from "../../components/shared/AppSurface"

export default function SettingsPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [repoUrl, setRepoUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/login")
      return
    }

    api
      .get("/user/me")
      .then((res) => {
        const me = res.data as { github_repo?: string | null }
        if (!me.github_repo) {
          router.replace("/setup-repo")
          return
        }
        setRepoUrl(me.github_repo)
      })
      .catch(() => router.replace("/login"))
      .finally(() => setIsCheckingAuth(false))
  }, [router])

  async function handleSaveRepo() {
    setError(null)
    setSuccess(null)
    setIsSaving(true)

    try {
      await api.post("/set-repo", { repo_url: repoUrl })
      setSuccess("Repository updated successfully.")
    } catch (err: unknown) {
      const detail =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail === "string"
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : "Failed to save repository"
      setError(detail)
    } finally {
      setIsSaving(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-full border border-white/10 bg-background/60 px-5 py-3 text-sm text-muted-foreground backdrop-blur-xl">
          Checking session...
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <AppSurface>
          <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Settings</div>
          <h2 className="mt-2 text-3xl font-semibold">Control your archive pipeline</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Your connected repository is where daily and monthly logs become visible proof of consistency.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-[1.75rem] border border-white/10 bg-background/55 p-5">
              <div className="text-sm text-muted-foreground">Current mode</div>
              <div className="mt-2 text-xl font-semibold">Git-backed progress archive</div>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-background/55 p-5">
              <div className="text-sm text-muted-foreground">Why it matters</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Strong projects are not just built. They are documented, reviewable, and easy to narrate.
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
            <Input
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
          </div>
        </AppSurface>
      </div>
    </DashboardLayout>
  )
}
