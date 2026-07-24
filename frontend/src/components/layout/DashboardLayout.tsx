"use client"

import WorkspaceShell from "./WorkspaceShell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <WorkspaceShell>{children}</WorkspaceShell>
}
