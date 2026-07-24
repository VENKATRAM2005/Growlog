"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, ListTodo, SunMedium, TimerReset } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/today", label: "Today", icon: TimerReset },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/archive", label: "Archive", icon: FileText },
  { href: "/settings", label: "Settings", icon: SunMedium },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="glass-panel fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[1.75rem] border-white/10 bg-background/80 p-2 backdrop-blur-2xl xl:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center rounded-2xl px-2 text-[11px] font-medium transition",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
            )}
          >
            <Icon className="mb-1 size-4" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
