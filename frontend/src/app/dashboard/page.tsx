import ProductivityMetrics from "@/components/analytics/ProductivityMetrics"
import WeeklyActivityGraph from "@/components/analytics/WeeklyActivityGraph"

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <section>
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Dashboard
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Your Productivity Command Center
        </h1>

        <p className="mt-3 max-w-3xl text-muted-foreground">
          Track your momentum, understand your weekly performance, and build
          consistent execution every single day.
        </p>
      </section>

      <ProductivityMetrics />

      <WeeklyActivityGraph />

      <div className="rounded-[2rem] border border-dashed border-white/10 p-10 text-center">
        <h2 className="text-2xl font-semibold">
          GitHub Contribution Heatmap
        </h2>

        <p className="mt-3 text-muted-foreground">
          Coming in the next sprint. This section will visualize your daily
          productivity over the past year with a GitHub-style contribution
          graph.
        </p>
      </div>

      <div className="rounded-[2rem] border border-dashed border-white/10 p-10 text-center">
        <h2 className="text-2xl font-semibold">
          Recent Activity
        </h2>

        <p className="mt-3 text-muted-foreground">
          Soon you&apos;ll see completed tasks, streak milestones, and execution
          history in one place.
        </p>
      </div>
    </main>
  )
}