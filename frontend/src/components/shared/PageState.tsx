import { AlertCircle, Inbox, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PageStateProps = {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function LoadingState({
  title = "Loading...",
  description = "Pulling the latest workspace data.",
  className,
}: Omit<PageStateProps, "actionLabel" | "onAction">) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-[1.75rem] border border-white/10 bg-background/50 px-6 py-10 text-center",
        className
      )}
    >
      <LoaderCircle className="size-7 animate-spin text-primary" />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: PageStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-background/45 px-6 py-10 text-center",
        className
      )}
    >
      <Inbox className="size-7 text-primary" />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5 rounded-full px-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

export function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: PageStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-[1.75rem] border border-destructive/25 bg-destructive/5 px-6 py-10 text-center",
        className
      )}
    >
      <AlertCircle className="size-7 text-destructive" />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5 rounded-full px-5" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
