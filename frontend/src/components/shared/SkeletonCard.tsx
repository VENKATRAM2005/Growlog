import { cn } from "@/lib/utils"

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-[1.5rem] border border-white/10 bg-background/55 p-5", className)}>
      <div className="h-4 w-28 rounded-full bg-white/10" />
      <div className="mt-4 h-10 w-24 rounded-full bg-white/10" />
      <div className="mt-4 h-3 w-full rounded-full bg-white/10" />
      <div className="mt-2 h-3 w-2/3 rounded-full bg-white/10" />
    </div>
  )
}
