"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Github, Link2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "../../api/client"
import ThemeToggle from "../../components/theme/ThemeToggle"
import { getApiErrorMessage } from "../../lib/api-error"

export default function SetupRepoPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [connectedRepo, setConnectedRepo] = useState<string | null>(null)
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
        if (me.github_repo) {
          setConnectedRepo(me.github_repo)
          setRepoUrl(me.github_repo)
        }
      })
      .catch(() => {
        router.replace("/login")
      })
      .finally(() => setIsCheckingAuth(false))
  }, [router])

async function handleSaveRepo() {
  setError(null)
  setSuccess(null)
  setIsSaving(true)

  try {
    await api.post("/set-repo", { repo_url: repoUrl })

    setConnectedRepo(repoUrl)
    setSuccess("Repository connected successfully.")

    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  } catch (err: unknown) {
    setError(getApiErrorMessage(err, "Failed to save repository"))
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
    <div className="relative min-h-screen overflow-hidden px-4 py-8 md:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,197,110,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(53,208,255,0.14),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(184,255,114,0.12),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(53,208,255,0.15),transparent_28%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" className="rounded-full px-4" onClick={() => router.push("/dashboard")}>
            Back
          </Button>
          <ThemeToggle />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1.05fr]">
          <section className="section-shell border-white/10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/55 px-4 py-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Proof-of-progress pipeline
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight md:text-5xl">
              Connect your repo and make your work leave receipts.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Every completion can regenerate your daily and monthly logs, giving you a Git-backed trail of consistency.
            </p>
            <div className="mt-8 space-y-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-background/55 p-5">
                <div className="font-medium">What you get</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Daily archives, visible progress history, and a cleaner story for demos, resumes, and personal reflection.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-background/55 p-5">
                <div className="font-medium">Recommended repo</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  A dedicated private repo such as <span className="font-medium text-foreground">growlog-archive</span> keeps your execution artifacts organized.
                </p>
              </div>
            </div>
          </section>

          <section className="section-shell border-white/10 bg-background/60">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Github className="size-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Repository sync</div>
                <div className="text-2xl font-semibold">Connect GitHub repo</div>
              </div>
            </div>

            {connectedRepo ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-background/55 p-5">
                <div className="text-sm text-muted-foreground">Currently connected</div>
                <div className="mt-2 break-all font-medium">{connectedRepo}</div>
              </div>
            ) : null}

                        <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveRepo()
              }}
            >
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary" />
                <Input
                  aria-label="GitHub repository URL"
                  placeholder="https://github.com/user/growlog-archive.git"
                  value={repoUrl}
                  onChange={(event) => setRepoUrl(event.target.value)}
                  disabled={isSaving}
                  className="h-[52px] rounded-2xl border-white/10 bg-background/55 pl-11"
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {success ? <p className="text-sm text-primary">{success}</p> : null}

              <Button
                type="submit"
                className="h-12 w-full rounded-2xl"
                disabled={isSaving || !repoUrl.trim()}
              >
                {isSaving ? "Saving..." : "Save repository"}
              </Button>

              <Button
                type="button"
                className="h-12 w-full rounded-2xl"
                variant="outline"
                onClick={() => {
                    localStorage.setItem("growlog-skip-repo", "true")
                    router.push("/dashboard")
                }}
              >
                Continue without GitHub
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                You can connect a GitHub repository later from{" "}
                <span className="font-medium">Settings</span>.
              </p>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}