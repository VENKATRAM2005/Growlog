import { useQuery } from "@tanstack/react-query"
import { getMonthlyAnalytics, getWeeklyAnalytics } from "./api"

export function useWeeklyAnalytics() {
  return useQuery({
    queryKey: ["weeklyAnalytics"],
    queryFn: getWeeklyAnalytics,
  })
}

export function useMonthlyAnalytics() {
  return useQuery({
    queryKey: ["monthlyAnalytics"],
    queryFn: getMonthlyAnalytics,
  })
}

