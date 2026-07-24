import calendar
import logging
import os
from datetime import date, datetime

from sqlalchemy.orm import Session

from backend.models.task import Task, TaskStatus
from backend.config import ENABLE_GIT_PUSH
from backend.services.git_service import git_commit_and_push


BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
logger = logging.getLogger("growlog.logs")


def _daily_file_paths(user, target_date: date) -> list[str]:
    # Keep a local copy in `backend/logs/` for debugging, but commit from
    # `backend/user_repos/{username}/logs/`.
    backend_logs_dir = os.path.join(BACKEND_DIR, "logs")
    user_repo_logs_dir = os.path.join(BACKEND_DIR, "user_repos", user.username, "logs")

    os.makedirs(backend_logs_dir, exist_ok=True)
    os.makedirs(user_repo_logs_dir, exist_ok=True)

    filename = f"{target_date}.txt"
    return [
        os.path.join(backend_logs_dir, filename),
        os.path.join(user_repo_logs_dir, filename),
    ]


def _monthly_file_paths(user, target_month: date) -> list[str]:
    backend_logs_dir = os.path.join(BACKEND_DIR, "logs")
    user_repo_logs_dir = os.path.join(BACKEND_DIR, "user_repos", user.username, "logs")

    os.makedirs(backend_logs_dir, exist_ok=True)
    os.makedirs(user_repo_logs_dir, exist_ok=True)

    filename = f"{target_month.year}-{target_month.month:02d}.txt"
    return [
        os.path.join(backend_logs_dir, filename),
        os.path.join(user_repo_logs_dir, filename),
    ]


def _format_daily_log(db: Session, user, target_date: date) -> str:
    tasks = db.query(Task).filter(Task.user_id == user.id).all()

    included: list[Task] = []
    for task in tasks:
        if task.status == TaskStatus.COMPLETED:
            if task.completed_at is None:
                continue
            if task.completed_at.date() != target_date:
                continue
            included.append(task)
        elif task.created_at.date() <= target_date:
            included.append(task)

    included.sort(key=lambda task: task.created_at)

    lines = [
        f"{target_date}",
        "",
        f"{user.username}:",
    ]

    for task in included:
        created_time = task.created_at.strftime("%I:%M %p")
        if task.status == TaskStatus.COMPLETED and task.completed_at is not None:
            completed_time = task.completed_at.strftime("%I:%M %p")
            lines.append(
                f"[{created_time}] - {task.title} [done] (Completed at {completed_time})"
            )
        else:
            lines.append(f"[{created_time}] - {task.title}")

    lines.append("")
    return "\n".join(lines)


def _format_monthly_log(db: Session, user, target_month: date) -> str:
    _, last_day = calendar.monthrange(target_month.year, target_month.month)
    lines: list[str] = [f"{target_month.year}-{target_month.month:02d}", ""]

    for day in range(1, last_day + 1):
        current = date(target_month.year, target_month.month, day)
        lines.append(_format_daily_log(db, user, current).rstrip())
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def regenerate_logs(
    db: Session,
    user,
    target_date: date,
    *,
    trigger_git: bool = True,
) -> dict:
    daily_paths = _daily_file_paths(user, target_date)
    daily_content = _format_daily_log(db, user, target_date)

    for path in daily_paths:
        with open(path, "w", encoding="utf-8") as file_obj:
            file_obj.write(daily_content)

    month_anchor = date(target_date.year, target_date.month, 1)
    monthly_paths = _monthly_file_paths(user, month_anchor)
    monthly_content = _format_monthly_log(db, user, month_anchor)

    for path in monthly_paths:
        with open(path, "w", encoding="utf-8") as file_obj:
            file_obj.write(monthly_content)

    if trigger_git and ENABLE_GIT_PUSH and user.github_repo:
        try:
            git_commit_and_push(
                user.github_repo,
                user.username,
                f"Growlog update {target_date}",
            )
        except Exception:
            logger.exception(
                "log sync failed user=%s target_date=%s",
                user.username,
                target_date,
            )

    return {
        "daily": daily_paths,
        "monthly": monthly_paths,
        "target_date": str(target_date),
    }


def generate_daily_log(db: Session, user):
    today = datetime.utcnow().date()
    return regenerate_logs(db, user, today, trigger_git=True)
