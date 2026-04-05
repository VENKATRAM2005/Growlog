import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Github,
  Sparkles,
  TimerReset,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import ThemeToggle from "../components/theme/ThemeToggle"

const features = [
  {
    title: "Momentum dashboard",
    description: "See completed work, backlog pressure, and weekly movement in one focused surface.",
    icon: BarChart3,
  },
  {
    title: "Proof-of-progress logs",
    description: "Push daily execution history into a GitHub repo so your work has receipts.",
    icon: Github,
  },
  {
    title: "Frictionless capture",
    description: "Turn a messy thought like 'gym, revise dsa, ship api' into structured tasks instantly.",
    icon: CheckCircle2,
  },
  {
    title: "Builder-friendly rhythm",
    description: "Designed to make hard work feel energizing, visible, and worth returning to tomorrow.",
    icon: TimerReset,
  },
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 md:px-8 md:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,194,102,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(41,167,255,0.12),transparent_22%),radial-gradient(circle_at_bottom_center,rgba(23,89,74,0.08),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(184,255,114,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(53,208,255,0.14),transparent_24%),radial-gradient(circle_at_bottom_center,rgba(125,140,255,0.14),transparent_28%)]" />

      <div className="relative mx-auto max-w-7xl">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-background/55 px-4 py-3 backdrop-blur-2xl md:px-6">
          <div className="font-mono text-sm uppercase tracking-[0.28em] text-muted-foreground">
            Growlog
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link href="/register">Start free</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-8 pb-10 pt-10 md:pt-16 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="section-shell hero-glow border-white/10 px-7 py-10 md:px-10 md:py-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl">
              <Sparkles className="size-4 text-primary" />
              Built to make consistency addictive
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] md:text-6xl xl:text-7xl">
              The execution dashboard that makes work feel undeniable.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Growlog blends a premium productivity cockpit with proof-of-progress logs,
              momentum analytics, and a flow that keeps ambitious builders moving.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/register">
                  Build your rhythm
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/10 bg-background/50 px-6 backdrop-blur-xl">
                <Link href="/login">Open dashboard</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-background/55 p-5 backdrop-blur-xl">
                <div className="text-sm text-muted-foreground">Live focus score</div>
                <div className="mt-3 text-4xl font-semibold">87</div>
                <div className="mt-2 text-sm text-muted-foreground">Balanced from completion pace, backlog health, and weekly consistency.</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-background/55 p-5 backdrop-blur-xl">
                <div className="text-sm text-muted-foreground">Visible progress</div>
                <div className="mt-3 text-4xl font-semibold">Daily logs</div>
                <div className="mt-2 text-sm text-muted-foreground">Every finished task can become an artifact, not just a checked box.</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-background/55 p-5 backdrop-blur-xl">
                <div className="text-sm text-muted-foreground">Built for builders</div>
                <div className="mt-3 text-4xl font-semibold">Fast</div>
                <div className="mt-2 text-sm text-muted-foreground">Capture work in seconds and stay inside momentum instead of managing software.</div>
              </div>
            </div>
          </div>

          <div className="section-shell border-white/10 bg-background/58 p-6 md:p-7">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950 px-5 py-5 text-slate-50 shadow-2xl dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-lime-300/80">Today at a glance</div>
                  <div className="mt-2 text-2xl font-semibold">Momentum is climbing</div>
                </div>
                <div className="rounded-full bg-lime-300/15 px-3 py-1 text-sm text-lime-200">+18%</div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl bg-white/6 p-4">
                  <div className="text-sm text-slate-300">Completed today</div>
                  <div className="mt-3 text-4xl font-semibold">6</div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-3xl bg-white/6 p-4">
                    <div className="text-sm text-slate-300">Focus window</div>
                    <div className="mt-3 text-2xl font-semibold">09:00-12:00</div>
                  </div>
                  <div className="rounded-3xl bg-white/6 p-4">
                    <div className="text-sm text-slate-300">Streak</div>
                    <div className="mt-3 text-2xl font-semibold">11 days</div>
                  </div>
                </div>
                <div className="rounded-3xl bg-gradient-to-r from-lime-300/16 via-cyan-300/14 to-indigo-300/16 p-4">
                  <div className="text-sm text-slate-300">Quick capture</div>
                  <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-slate-200">
                    ship task router polish, system design review, ship deploy notes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 pb-12 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ title, description, icon: Icon }) => (
            <div key={title} className="section-shell border-white/10 bg-background/48">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
