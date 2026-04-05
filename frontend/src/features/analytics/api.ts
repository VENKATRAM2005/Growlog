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

