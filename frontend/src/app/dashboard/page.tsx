"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, Sparkles, Target } from "lucide-react"

import api from "../../api/client"
import ProductivityMetrics from "../../components/analytics/ProductivityMetrics"
import WeeklyActivityGraph from "../../components/analytics/WeeklyActivityGraph"
import DashboardLayout from "../../components/layout/DashboardLayout"
import AppSurface from "../../components/shared/AppSurface"
import CompletedTaskList from "../../components/tasks/CompletedTaskList"
import PendingTaskList from "../../components/tasks/PendingTaskList"
import TaskInputPanel from "../../components/tasks/TaskInputPanel"

export default function DashboardPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [username, setUsername] = useState("builder")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/login")
      return
    }

    api
      .get("/user/me")
      .then((res) => {
        const me = res.data as { github_repo?: string | null; username?: string }
        setUsername(me.username ?? "builder")
        if (!me.github_repo) {
          router.replace("/setup-repo")
        }
      })
      .catch(() => {
        router.replace("/login")
      })
      .finally(() => setIsCheckingAuth(false))
  }, [router])

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
      <div className="space-y-4">
        <AppSurface className="hero-glow overflow-hidden">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/60 px-4 py-2 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-primary" />
                Welcome back, {username}
              </div>
              <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
                Keep the pace high and the friction low.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Capture the next move, close work with intent, and let your dashboard
                reflect the momentum you are building in real time.
              </p>
              <div className="mt-6">
                <TaskInputPanel />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[1.75rem] border border-white/10 bg-background/55 p-5">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Execution focus</span>
                  <ArrowUpRight className="size-4 text-primary" />
                </div>
                <div className="mt-4 text-4xl font-semibold">87</div>
                <p className="mt-2 text-sm text-muted-foreground">High momentum with room to cut remaining backlog.</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-background/55 p-5">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Weekly target</span>
                  <Target className="size-4 text-primary" />
                </div>
                <div className="mt-4 text-4xl font-semibold">12/15</div>
                <p className="mt-2 text-sm text-muted-foreground">Three strong finishes away from a clean weekly win.</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-background/55 p-5">
                <div className="text-sm text-muted-foreground">Focus reminder</div>
                <div className="mt-4 text-xl font-semibold">Close one meaningful task before adding three more.</div>
              </div>
            </div>
          </div>
        </AppSurface>

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <ProductivityMetrics />
          <WeeklyActivityGraph />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <PendingTaskList />
          <CompletedTaskList />
        </div>
      </div>
    </DashboardLayout>
  )
}
