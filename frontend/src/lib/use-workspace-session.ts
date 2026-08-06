"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { getToken } from "./auth"
import { useCurrentUser } from "../features/user/hooks"

type WorkspaceSessionOptions = {
  requireRepo?: boolean
}

export function useWorkspaceSession(options: WorkspaceSessionOptions = {}) {
  const { requireRepo = false } = options
  const router = useRouter()
  const token = getToken()
  const userQuery = useCurrentUser(Boolean(token))
  const skipped =
    typeof window !== "undefined" &&
    localStorage.getItem("growlog-skip-repo") === "true"

  useEffect(() => {
    if (!token) {
      router.replace("/login")
      return
    }

    if (userQuery.isError) {
      router.replace("/login")
      return
    }

if (
  requireRepo &&
  userQuery.data &&
  !userQuery.data.github_repo &&
  !skipped
) {
  router.replace("/setup-repo")
}
  }, [requireRepo, router, skipped, token, userQuery.data, userQuery.isError])

  return {
    token,
    user: userQuery.data,
    isCheckingSession: Boolean(token) && userQuery.isLoading,
    requiresSetup: requireRepo && Boolean(userQuery.data && !userQuery.data.github_repo && !skipped),
    isAuthenticated: Boolean(token && userQuery.data),
    error: userQuery.error,
  }
}
