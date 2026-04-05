from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from backend.models.task import TaskStatus


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TaskCreateRequest(BaseModel):
    input_text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Comma, semicolon, or newline separated task titles.",
    )


class TaskResponse(ORMModel):
    id: int
    title: str = Field(..., min_length=1, max_length=120)
    status: str = Field(..., pattern=f"^({TaskStatus.PENDING}|{TaskStatus.COMPLETED})$")
    created_at: datetime
    completed_at: datetime | None = None


class TaskCreateResponse(BaseModel):
    tasks_created: list[str] = Field(default_factory=list)
    total_created: int = Field(..., ge=0)


class TaskActionResponse(BaseModel):
    message: str
    task: TaskResponse
    already_completed: bool = False
