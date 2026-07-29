import api from "../../api/client"
import { MonthlyAnalyticsResponse, WeeklyAnalyticsResponse } from "./types"

export async function getWeeklyAnalytics(): Promise<WeeklyAnalyticsResponse> {
  const res = await api.get("/analytics/weekly")
  return res.data
}

export async function getMonthlyAnalytics(): Promise<MonthlyAnalyticsResponse> {
  const res = await api.get("/analytics/monthly")
  return res.data
}

export interface HeatmapDay {
  date: string
  count: number
}

export interface DashboardAnalytics {
  today_completed: number
  pending_count: number
  completed_tasks: number
  current_streak: number
  longest_streak: number
  active_days: number
  completion_rate: number
}

export async function getHeatmap(): Promise<HeatmapDay[]> {
  const res = await api.get("/analytics/heatmap")
  return res.data
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const res = await api.get("/analytics/dashboard")
  return res.data
}

