import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ArchivePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <section>
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Archive
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Proof of Progress
        </h1>

        <p className="mt-3 max-w-3xl text-muted-foreground">
          Store your execution history, connect your GitHub repository,
          and maintain a permanent record of your work.
        </p>
      </section>

      <div className="rounded-[2rem] border border-dashed border-white/10 p-10">
        <h2 className="text-2xl font-semibold">
          Repository Sync
        </h2>

        <p className="mt-3 text-muted-foreground">
          Connect your GitHub repository to generate daily and monthly
          productivity logs.
        </p>

        <Button asChild className="mt-6">
          <Link href="/setup-repo">
            Connect Repository
          </Link>
        </Button>
      </div>

      <div className="rounded-[2rem] border border-dashed border-white/10 p-10">
        <h2 className="text-2xl font-semibold">
          Archive History
        </h2>

        <p className="mt-3 text-muted-foreground">
          Daily logs, monthly summaries, and Git-backed activity history
          will appear here.
        </p>
      </div>
    </main>
  )
}