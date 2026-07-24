import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type MetricCardProps = {
  title: string
  value: string | number
  caption: string
  icon: LucideIcon
  accent?: "primary" | "chart" | "warm"
  className?: string
}

const accentClassMap = {
  primary: "bg-primary/12 text-primary",
  chart: "bg-chart-4/12 text-chart-4",
  warm: "bg-chart-2/12 text-chart-2",
}

export function MetricCard({
  title,
  value,
  caption,
  icon: Icon,
  accent = "primary",
  className,
}: MetricCardProps) {
  return (
    <div className={cn("rounded-[1.5rem] border border-white/10 bg-background/55 p-5", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className={cn("flex size-10 items-center justify-center rounded-2xl", accentClassMap[accent])}>
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-4 text-4xl font-semibold tracking-[-0.04em]">{value}</div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{caption}</p>
    </div>
  )
}
