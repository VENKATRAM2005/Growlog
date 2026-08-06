"use client"

import WorkspaceShell from "@/components/layout/WorkspaceShell"
import { LoadingState } from "@/components/shared/PageState"
import { useWorkspaceSession } from "@/lib/use-workspace-session"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = useWorkspaceSession()

  if (!session.token || session.isCheckingSession) {
    return (
      <div className="px-3 py-3 md:px-4 md:py-4">
        <LoadingState
          title="Loading Workspace"
          description="Checking your session before opening Growlog."
        />
      </div>
    )
  }

  if (!session.user) {
    return null
  }

  return <WorkspaceShell>{children}</WorkspaceShell>
}
