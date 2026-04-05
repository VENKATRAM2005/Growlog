from __future__ import annotations

import calendar
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.models.task import Task, TaskStatus
from backend.schemas.analytics import AnalyticsResponse, MonthlyAnalyticsResponse
from backend.utils.dependencies import get_current_user, get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _day_range_utc(d: date) -> tuple[datetime, datetime]:
    """
    Build an inclusive/exclusive UTC datetime window for a given day.
    """
    start = datetime(d.year, d.month, d.day)
    end = start + timedelta(days=1)
    return start, end


def _completed_counts_for_days(db: Session, user_id: int, days: list[date]) -> list[int]:
    completed_counts: list[int] = []
    for d in days:
        start, end = _day_range_utc(d)
        count = (
            db.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.status == TaskStatus.COMPLETED,
                Task.completed_at.isnot(None),
                Task.completed_at >= start,
                Task.completed_at < end,
            )
            .count()
        )
        completed_counts.append(count)
    return completed_counts


@router.get("/weekly", response_model=AnalyticsResponse)
def weekly_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    today = datetime.utcnow().date()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]

    pending_count = (
        db.query(Task)
        .filter(Task.user_id == current_user.id, Task.status == TaskStatus.PENDING)
        .count()
    )

    completed_counts = _completed_counts_for_days(db, current_user.id, days)
    today_completed = completed_counts[-1] if completed_counts else 0

    return {
        "today_completed": today_completed,
        "pending_count": pending_count,
        "days": [d.isoformat() for d in days],
        "completed_counts": completed_counts,
    }


@router.get("/monthly", response_model=MonthlyAnalyticsResponse)
def monthly_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    today = datetime.utcnow().date()
    month_start = today.replace(day=1)
    _, last_day = calendar.monthrange(today.year, today.month)

    days = [date(today.year, today.month, day) for day in range(1, last_day + 1)]

    pending_count = (
        db.query(Task)
        .filter(Task.user_id == current_user.id, Task.status == TaskStatus.PENDING)
        .count()
    )

    completed_counts = _completed_counts_for_days(db, current_user.id, days)
    today_completed = (
        completed_counts[today.day - 1] if 1 <= today.day <= len(completed_counts) else 0
    )

    return {
        "today_completed": today_completed,
        "pending_count": pending_count,
        "month": f"{month_start.year}-{month_start.month:02d}",
        "days": [d.isoformat() for d in days],
        "completed_counts": completed_counts,
    }

