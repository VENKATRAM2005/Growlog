from __future__ import annotations

import calendar
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.models.task import Task, TaskStatus
from backend.schemas.analytics import (
    AnalyticsResponse,
    MonthlyAnalyticsResponse,
    DashboardAnalyticsResponse,
)
from backend.utils.dependencies import get_current_user, get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _day_range_utc(d: date) -> tuple[datetime, datetime]:
    start = datetime(d.year, d.month, d.day)
    end = start + timedelta(days=1)
    return start, end


def _completed_counts_for_days(
    db: Session, user_id: int, days: list[date]
) -> list[int]:
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

    days = [
        date(today.year, today.month, day)
        for day in range(1, last_day + 1)
    ]

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

    total_tasks = (
        db.query(Task)
        .filter(Task.user_id == current_user.id)
        .count()
    )

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
        "completion_rate": round(
            (completed_tasks / total_tasks) * 100, 1
        )
        if total_tasks
        else 0.0,
    }