import { cn } from "@/lib/utils"

export default function AppSurface({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "section-shell border-white/10 bg-background/50 backdrop-blur-2xl",
        className
      )}
    >
      {children}
    </section>
  )
}
