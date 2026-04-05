from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    today_completed: int
    pending_count: int
    days: list[str]
    completed_counts: list[int]


class MonthlyAnalyticsResponse(AnalyticsResponse):
    month: str
