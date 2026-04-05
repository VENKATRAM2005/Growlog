from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.models.task import TaskStatus
from backend.models.user import User
from backend.schemas.task import (
    TaskActionResponse,
    TaskCreateRequest,
    TaskCreateResponse,
    TaskResponse,
)
from backend.services.task_service import (
    complete_task_for_user,
    create_tasks_for_user,
    list_tasks_for_user_by_status,
)
from backend.utils.dependencies import get_current_user, get_db

router = APIRouter(prefix="/tasks", tags=["Tasks"])

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post("/create", response_model=TaskCreateResponse, status_code=status.HTTP_201_CREATED)
def create_tasks(
    payload: TaskCreateRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    tasks = create_tasks_for_user(db, current_user, payload.input_text)
    created_titles = [task.title for task in tasks]
    return {"tasks_created": created_titles, "total_created": len(created_titles)}


@router.get("/pending", response_model=list[TaskResponse])
def get_pending_tasks(
    db: DbSession,
    current_user: CurrentUser,
):
    return list_tasks_for_user_by_status(db, current_user, TaskStatus.PENDING)


@router.get("/completed", response_model=list[TaskResponse])
def get_completed_tasks(
    db: DbSession,
    current_user: CurrentUser,
):
    return list_tasks_for_user_by_status(db, current_user, TaskStatus.COMPLETED)


@router.put("/complete/{task_id}", response_model=TaskActionResponse)
def complete_task(
    task_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    task, already_completed = complete_task_for_user(db, current_user, task_id)
    return {
        "message": "Task already completed" if already_completed else "Task completed",
        "task": task,
        "already_completed": already_completed,
    }
