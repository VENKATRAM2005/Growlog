import ProductivityMetrics from "@/components/analytics/ProductivityMetrics"
import WeeklyActivityGraph from "@/components/analytics/WeeklyActivityGraph"
import ContributionHeatmap from "@/components/analytics/ContributionHeatmap"

export default function AnalyticsPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <section>
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Analytics
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Measure Your Momentum
        </h1>

        <p className="mt-3 max-w-3xl text-muted-foreground">
          Understand your execution patterns, monitor consistency, and
          build long-term momentum with data that reflects your daily work.
        </p>
      </section>

      <ProductivityMetrics />

      <WeeklyActivityGraph />

      <ContributionHeatmap />
    </main>
  )
}