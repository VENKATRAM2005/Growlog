"use client"

import { useMemo } from "react"

import { useHeatmap } from "@/features/analytics/hooks"

const DAYS = 365

type HeatmapCell = {
  date: string
  count: number
  isToday: boolean
}

type HeatmapWeek = (HeatmapCell | null)[]

const INTENSITY_CLASSES = [
  "bg-muted/30",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-300 dark:bg-emerald-700",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-700 dark:bg-emerald-300",
] as const

function getIntensity(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

function formatTooltip(date: string, count: number) {
  const formatted = new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return `${formatted}: ${count} completed task${count === 1 ? "" : "s"}`
}

function LoadingGrid() {
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {Array.from({ length: DAYS }).map((_, index) => (
          <div
            key={index}
            className="size-3 animate-pulse rounded-sm bg-muted/40"
          />
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
      Complete your first task to start building your contribution history.
    </div>
  )
}

function buildWeeks(data: HeatmapCell[]): HeatmapWeek[] {
  if (data.length === 0) return []

  const weeks: HeatmapWeek[] = []
  let currentWeek: HeatmapWeek = []

  const firstDay = new Date(data[0].date).getDay()

  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null)
  }

  for (const cell of data) {
    currentWeek.push(cell)

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push(null)
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
}

function buildMonthLabels(weeks: HeatmapWeek[]) {
  const labels: { label: string; column: number }[] = []
  let lastMonth = -1

  weeks.forEach((week, column) => {
    const firstCell = week.find(Boolean)

    if (!firstCell) return

    const month = new Date(firstCell.date).getMonth()

    if (month !== lastMonth) {
      labels.push({
        label: new Date(firstCell.date).toLocaleDateString(undefined, {
          month: "short",
        }),
        column,
      })

      lastMonth = month
    }
  })

  return labels
}

function Legend() {
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
      <span>Less</span>

      {INTENSITY_CLASSES.map((colour, index) => (
        <div
          key={index}
          className={`size-3 rounded-sm ${colour}`}
        />
      ))}

      <span>More</span>
    </div>
  )
}

export default function ContributionHeatmap() {
  const { data, isLoading } = useHeatmap()

  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  )

  const cells = useMemo<HeatmapCell[]>(
    () =>
      (data ?? []).map((day) => ({
        ...day,
        isToday: day.date === today,
      })),
    [data, today]
  )

  const weeks = useMemo(
    () => buildWeeks(cells),
    [cells]
  )

  const monthLabels = useMemo(
    () => buildMonthLabels(weeks),
    [weeks]
  )

  if (isLoading) {
    return <LoadingGrid />
  }

  if (!cells.some((cell) => cell.count > 0)) {
    return <EmptyState />
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-max">
        <div
          className="mb-2 grid text-xs text-muted-foreground"
          style={{
            gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
          }}
        >
          {monthLabels.map((month) => (
            <div
              key={`${month.label}-${month.column}`}
              style={{ gridColumnStart: month.column + 1 }}
            >
              {month.label}
            </div>
          ))}
        </div>

        <div
          role="grid"
          className="flex gap-1"
        >
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="flex flex-col gap-1"
            >
              {week.map((cell, dayIndex) =>
                cell ? (
                  <div
                    key={cell.date}
                    role="gridcell"
                    title={formatTooltip(cell.date, cell.count)}
                    aria-label={formatTooltip(cell.date, cell.count)}
                    className={[
                      "size-3 rounded-sm transition-all",
                      INTENSITY_CLASSES[getIntensity(cell.count)],
                      cell.isToday && cell.count > 0
                        ? "animate-pulse ring-1 ring-primary"
                        : "",
                    ].join(" ")}
                  />
                ) : (
                  <div
                    key={`empty-${weekIndex}-${dayIndex}`}
                    className="size-3"
                  />
                )
              )}
            </div>
          ))}
        </div>

        <Legend />
      </div>
    </div>
  )
}