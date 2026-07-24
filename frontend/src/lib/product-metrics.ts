import { MonthlyAnalyticsResponse, WeeklyAnalyticsResponse } from "../features/analytics/types"
import { Task } from "../features/tasks/types"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function calculateMomentumScore({
  weekly,
  completedTasks,
  pendingTasks,
}: {
  weekly?: WeeklyAnalyticsResponse
  completedTasks?: Task[]
  pendingTasks?: Task[]
}) {
  const weeklyTotal = weekly?.completed_counts.reduce((sum, current) => sum + current, 0) ?? 0
  const completed = completedTasks?.length ?? 0
  const pending = pendingTasks?.length ?? 0
  const total = completed + pending
  const completionRate = total > 0 ? completed / total : 0

  const rawScore = 45 + weeklyTotal * 4 + completionRate * 25 - Math.max(0, pending - 3) * 2
  return clamp(Math.round(rawScore), 0, 99)
}

export function calculateStreak(weekly?: WeeklyAnalyticsResponse, monthly?: MonthlyAnalyticsResponse) {
  const counts = [...(monthly?.completed_counts ?? []), ...(weekly?.completed_counts ?? [])]
  if (!counts.length) {
    return 0
  }

  let streak = 0
  for (let index = counts.length - 1; index >= 0; index -= 1) {
    if ((counts[index] ?? 0) > 0) {
      streak += 1
    } else if (streak > 0) {
      break
    }
  }

  return streak
}

export function calculateCompletionRate(completedTasks?: Task[], pendingTasks?: Task[]) {
  const completed = completedTasks?.length ?? 0
  const pending = pendingTasks?.length ?? 0
  const total = completed + pending
  return total ? Math.round((completed / total) * 100) : 0
}

export function getPeakDay(weekly?: WeeklyAnalyticsResponse) {
  if (!weekly?.completed_counts.length || !weekly.days.length) {
    return null
  }

  const maxCount = Math.max(...weekly.completed_counts)
  const maxIndex = weekly.completed_counts.findIndex((count) => count === maxCount)
  if (maxIndex < 0 || maxCount === 0) {
    return null
  }

  return {
    count: maxCount,
    label: new Date(weekly.days[maxIndex]).toLocaleDateString(undefined, { weekday: "long" }),
  }
}
