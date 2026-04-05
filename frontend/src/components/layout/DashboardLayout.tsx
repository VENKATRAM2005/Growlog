"use client"

import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen px-3 py-3 md:px-4 md:py-4">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1600px] gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Sidebar />
        <div className="flex min-h-0 flex-col gap-4">
          <Topbar />
          <main className="min-h-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
