import { useQuery } from "@tanstack/react-query"
import { getMonthlyAnalytics, getWeeklyAnalytics } from "./api"
import { api } from "@/lib/api"

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

export interface HeatmapDay {
  date: string
  count: number
}

export function useHeatmap() {
  return useQuery({
    queryKey: ["analytics", "heatmap"],
    queryFn: async () => {
      const { data } = await api.get<HeatmapDay[]>("/analytics/heatmap")
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

