from __future__ import annotations

import calendar
from datetime import date, datetime, timedelta, UTC

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.models.task import Task, TaskStatus
from backend.schemas.analytics import (
    AnalyticsResponse,
    DashboardAnalyticsResponse,
    MonthlyAnalyticsResponse,
    HeatmapDay,
)
from backend.utils.dependencies import get_current_user, get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _day_range_utc(d: date) -> tuple[datetime, datetime]:
    start = datetime(d.year, d.month, d.day)
    end = start + timedelta(days=1)
    return start, end

def _build_completed_counts(
    db: Session,
    user_id: int,
    start_day: date,
    end_day: date,
) -> dict[date, int]:
    start_dt, _ = _day_range_utc(start_day)
    _, end_dt = _day_range_utc(end_day)

    rows = (
        db.query(
            func.date(Task.completed_at),
            func.count(Task.id),
        )
        .filter(
            Task.user_id == user_id,
            Task.status == TaskStatus.COMPLETED,
            Task.completed_at.isnot(None),
            Task.completed_at >= start_dt,
            Task.completed_at < end_dt,
        )
        .group_by(func.date(Task.completed_at))
        .all()
    )

    return {
    (
        completed_date
        if isinstance(completed_date, date)
        else date.fromisoformat(str(completed_date))
    ): count
    for completed_date, count in rows
}

def _fill_missing_days(
    counts: dict[date, int],
    start_day: date,
    end_day: date,
) -> list[HeatmapDay]:
    result: list[HeatmapDay] = []

    current = start_day

    while current <= end_day:
        result.append(
            HeatmapDay(
                date=current.isoformat(),
                count=counts.get(current, 0),
            )
        )
        current += timedelta(days=1)

    return result

def _completed_counts_for_days(
    db: Session,
    user_id: int,
    days: list[date],
) -> list[int]:
    if not days:
        return []

    counts = _build_completed_counts(
        db,
        user_id,
        days[0],
        days[-1],
    )

    return [
        counts.get(day, 0)
        for day in days
    ]


def _active_dates(db: Session, user_id: int) -> list[date]:
    rows = (
        db.query(Task.completed_at)
        .filter(
            Task.user_id == user_id,
            Task.status == TaskStatus.COMPLETED,
            Task.completed_at.isnot(None),
        )
        .order_by(Task.completed_at.asc())
        .all()
    )

    return sorted({row[0].date() for row in rows})


def _current_streak(active: list[date]) -> int:
    if not active:
        return 0

    today = datetime.utcnow().date()

    if active[-1] == today:
        current = today
    elif active[-1] == today - timedelta(days=1):
        current = today - timedelta(days=1)
    else:
        return 0

    streak = 0
    active_set = set(active)

    while current in active_set:
        streak += 1
        current -= timedelta(days=1)

    return streak


def _longest_streak(active: list[date]) -> int:
    if not active:
        return 0

    longest = 1
    current = 1

    for i in range(1, len(active)):
        if active[i] == active[i - 1] + timedelta(days=1):
            current += 1
        else:
            longest = max(longest, current)
            current = 1

    return max(longest, current)


@router.get("/weekly", response_model=AnalyticsResponse)
def weekly_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    today = datetime.utcnow().date()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]

    pending_count = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == TaskStatus.PENDING,
        )
        .count()
    )

    completed_counts = _completed_counts_for_days(db, current_user.id, days)

    return {
        "today_completed": completed_counts[-1] if completed_counts else 0,
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

    _, last_day = calendar.monthrange(today.year, today.month)

    days = [date(today.year, today.month, day) for day in range(1, last_day + 1)]

    pending_count = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == TaskStatus.PENDING,
        )
        .count()
    )

    completed_counts = _completed_counts_for_days(
        db,
        current_user.id,
        days,
    )

    return {
        "today_completed": completed_counts[today.day - 1]
        if today.day <= len(completed_counts)
        else 0,
        "pending_count": pending_count,
        "month": f"{today.year}-{today.month:02d}",
        "days": [d.isoformat() for d in days],
        "completed_counts": completed_counts,
    }

@router.get(
    "/heatmap",
    response_model=list[HeatmapDay],
)
def get_heatmap(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    end_day = datetime.utcnow().date()
    start_day = end_day - timedelta(days=364)

    counts = _build_completed_counts(
        db,
        current_user.id,
        start_day,
        end_day,
    )

    return _fill_missing_days(
        counts,
        start_day,
        end_day,
    )

@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
def dashboard_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    today = datetime.utcnow().date()
    today_start, today_end = _day_range_utc(today)

    today_completed = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == TaskStatus.COMPLETED,
            Task.completed_at >= today_start,
            Task.completed_at < today_end,
        )
        .count()
    )

    pending_count = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == TaskStatus.PENDING,
        )
        .count()
    )

    total_tasks = db.query(Task).filter(Task.user_id == current_user.id).count()

    completed_tasks = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == TaskStatus.COMPLETED,
        )
        .count()
    )

    active = _active_dates(db, current_user.id)

    return {
        "today_completed": today_completed,
        "pending_count": pending_count,
        "current_streak": _current_streak(active),
        "longest_streak": _longest_streak(active),
        "active_days": len(active),
        "completion_rate": round((completed_tasks / total_tasks) * 100, 1)
        if total_tasks
        else 0.0,
    }

