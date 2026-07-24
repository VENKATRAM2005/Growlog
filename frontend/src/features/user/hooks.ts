import { useQuery } from "@tanstack/react-query"

import { getCurrentUser } from "./api"

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled,
    retry: false,
  })
}
