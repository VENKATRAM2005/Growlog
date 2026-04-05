from __future__ import annotations

from pydantic import BaseModel, Field


class ErrorInfo(BaseModel):
    code: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    details: list[dict] | None = None
    request_id: str = Field(..., min_length=1)


class ErrorResponse(BaseModel):
    error: ErrorInfo
