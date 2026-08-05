import { useQuery } from "@tanstack/react-query"
import {
  getMonthlyAnalytics,
  getWeeklyAnalytics,
  getHeatmap,
  getDashboardAnalytics,
} from "./api"

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

export function useHeatmap() {
  return useQuery({
    queryKey: ["analytics", "heatmap"],
    queryFn: getHeatmap,
    staleTime: 1000 * 60 * 10,
  })
}

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: getDashboardAnalytics,
  })
}