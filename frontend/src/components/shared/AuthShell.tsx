"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import ThemeToggle from "../theme/ThemeToggle"

type AuthShellProps = {
  title: string
  subtitle: string
  eyebrow: string
  footerText: string
  footerLinkLabel: string
  footerHref: string
  children: React.ReactNode
}

export default function AuthShell({
  title,
  subtitle,
  eyebrow,
  footerText,
  footerLinkLabel,
  footerHref,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 md:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,201,108,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(53,208,255,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(184,255,114,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(53,208,255,0.16),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10">
        <section className="hidden flex-1 xl:block">
          <div className="section-shell hero-glow max-w-2xl border-white/10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl">
              <Sparkles className="size-4 text-primary" />
              Momentum-first execution for ambitious builders
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.02]">
              Build consistency that feels visible every single day.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Growlog turns your tasks into proof-of-progress, energy-building routines,
              and a dashboard that makes momentum hard to ignore.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-background/55 p-5 backdrop-blur-xl">
                <div className="text-3xl font-semibold">7d</div>
                <div className="mt-2 text-sm text-muted-foreground">Consistency window with visible weekly trends.</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-background/55 p-5 backdrop-blur-xl">
                <div className="text-3xl font-semibold">1 tap</div>
                <div className="mt-2 text-sm text-muted-foreground">Task capture built for speed, not admin work.</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-background/55 p-5 backdrop-blur-xl">
                <div className="text-3xl font-semibold">Git-backed</div>
                <div className="mt-2 text-sm text-muted-foreground">Daily work archived into proof-of-progress logs.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-xl xl:max-w-lg">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="font-mono text-sm uppercase tracking-[0.28em] text-muted-foreground">
              Growlog
            </Link>
            <ThemeToggle />
          </div>

          <div className="section-shell border-white/10 bg-background/65 backdrop-blur-2xl">
            <div className="mb-8">
              <div className="text-sm uppercase tracking-[0.24em] text-primary">{eyebrow}</div>
              <h2 className="mt-3 text-4xl font-semibold">{title}</h2>
              <p className="mt-3 text-base text-muted-foreground">{subtitle}</p>
            </div>

            {children}

            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{footerText}</span>
              <Link href={footerHref} className="inline-flex items-center gap-1 font-medium text-foreground">
                {footerLinkLabel}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
