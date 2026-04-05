export interface WeeklyAnalyticsResponse {
  today_completed: number
  pending_count: number
  days: string[]
  completed_counts: number[]
}

export interface MonthlyAnalyticsResponse {
  today_completed: number
  pending_count: number
  month: string
  days: string[]
  completed_counts: number[]
}

