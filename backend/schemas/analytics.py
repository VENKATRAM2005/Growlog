from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    today_completed: int
    pending_count: int
    days: list[str]
    completed_counts: list[int]


class MonthlyAnalyticsResponse(AnalyticsResponse):
    month: str

class HeatmapDay(BaseModel):
    date: str
    count: int

class DashboardAnalyticsResponse(BaseModel):
    today_completed: int
    pending_count: int
    current_streak: int
    longest_streak: int
    active_days: int
    completion_rate: float
