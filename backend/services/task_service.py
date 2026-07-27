from __future__ import annotations

import re
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.task import Task, TaskStatus
from backend.services.log_service import regenerate_logs

MAX_TASKS_PER_REQUEST = 25
MAX_TASK_TITLE_LENGTH = 120
TASK_TITLE_SPLIT_PATTERN = re.compile(r"[,\n;]+")


def utcnow() -> datetime:
    return datetime.utcnow()


def normalize_task_title(raw: str) -> str:
    words = raw.strip().split()
    if not words:
        return ""
    normalized = " ".join(word[:1].upper() + word[1:].lower() for word in words)
    if len(normalized) > MAX_TASK_TITLE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Task titles must be at most {MAX_TASK_TITLE_LENGTH} characters long",
        )
    return normalized


def parse_task_titles(input_text: str) -> list[str]:
    unique_titles: list[str] = []
    seen: set[str] = set()

    for raw_title in TASK_TITLE_SPLIT_PATTERN.split(input_text):
        title = normalize_task_title(raw_title)
        title_key = title.casefold()
        if not title or title_key in seen:
            continue
        seen.add(title_key)
        unique_titles.append(title)
        if len(unique_titles) > MAX_TASKS_PER_REQUEST:
            raise HTTPException(
                status_code=400,
                detail=f"Provide no more than {MAX_TASKS_PER_REQUEST} tasks at once",
            )

    if not unique_titles:
        raise HTTPException(
            status_code=400, detail="Provide at least one valid task title"
        )

    return unique_titles


def create_tasks_for_user(db: Session, user, input_text: str) -> list[Task]:
    created_at = utcnow()
    tasks = [
        Task(
            title=title,
            user_id=user.id,
            status=TaskStatus.PENDING,
            created_at=created_at,
        )
        for title in parse_task_titles(input_text)
    ]

    db.add_all(tasks)
    db.commit()
    for task in tasks:
        db.refresh(task)

    regenerate_logs(
        db,
        user,
        created_at.date(),
        trigger_git=True,
    )
    return tasks


def list_tasks_for_user_by_status(db: Session, user, status: str) -> list[Task]:
    return (
        db.query(Task)
        .filter(Task.user_id == user.id, Task.status == status)
        .order_by(Task.created_at.desc(), Task.id.desc())
        .all()
    )


def complete_task_for_user(db: Session, user, task_id: int) -> tuple[Task, bool]:
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.status == TaskStatus.COMPLETED:
        return task, True

    task.status = TaskStatus.COMPLETED
    task.completed_at = utcnow()
    db.commit()
    db.refresh(task)

    regenerate_logs(
        db,
        user,
        task.completed_at.date(),
        trigger_git=True,
    )

    return task, False
