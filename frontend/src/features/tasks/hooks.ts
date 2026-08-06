import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getPendingTasks,
  getCompletedTasks,
  createTasks,
  completeTask,
} from "./api"

export function usePendingTasks() {
  return useQuery({
    queryKey: ["pendingTasks"],
    queryFn: getPendingTasks,
  })
}

export function useCompletedTasks() {
  return useQuery({
    queryKey: ["completedTasks"],
    queryFn: getCompletedTasks,
  })
}

export function useCreateTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingTasks"] })
      queryClient.invalidateQueries({ queryKey: ["weeklyAnalytics"] })
      queryClient.invalidateQueries({ queryKey: ["monthlyAnalytics"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] })
    },
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingTasks"] })
      queryClient.invalidateQueries({ queryKey: ["completedTasks"] })
      queryClient.invalidateQueries({ queryKey: ["weeklyAnalytics"] })
      queryClient.invalidateQueries({ queryKey: ["monthlyAnalytics"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] })
    },
  })
}
