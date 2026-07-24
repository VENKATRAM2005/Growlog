import logging
import os
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.database import engine, Base
from backend.models.user import User
from backend.models.task import Task
from backend.routers import auth, tasks, analytics
from backend.schemas.common import ErrorResponse
from backend.config import LOG_LEVEL

from slowapi.middleware import SlowAPIMiddleware
from backend.utils.rate_limit import limiter

from fastapi import Request
from fastapi.responses import JSONResponse

from backend.middleware.request_id import RequestIDMiddleware
from backend.utils.request_context import get_request_id

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("growlog.api")

@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Growlog API",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(RequestIDMiddleware)

_cors_origins_raw = os.getenv("GROWLOG_CORS_ORIGINS", "http://localhost:3000")
_cors_origins = [
    origin.strip()
    for origin in _cors_origins_raw.split(",")
    if origin and origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[] if "*" in _cors_origins else _cors_origins,
    allow_origin_regex=".*" if (os.getenv("GROWLOG_ENV", "development") == "development" and "*" in _cors_origins) else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_request_id(request: Request) -> str:
    return get_request_id()


def _error_response(
    request: Request,
    *,
    status_code: int,
    code: str,
    message: str,
    details: list[dict] | None = None,
) -> JSONResponse:
    request_id = _get_request_id(request)
    payload = ErrorResponse(
        error={
            "code": code,
            "message": message,
            "details": details,
            "request_id": request_id,
        }
    )
    return JSONResponse(
        status_code=status_code,
        content=payload.model_dump(exclude_none=True),
        headers={"X-Request-ID": request_id},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    details = exc.detail if isinstance(exc.detail, list) else None
    message = exc.detail if isinstance(exc.detail, str) else "Request failed"
    return _error_response(
        request,
        status_code=exc.status_code,
        code="http_error",
        message=message,
        details=details,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = [
        {
            "field": ".".join(str(part) for part in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        }
        for error in exc.errors()
    ]
    return _error_response(
        request,
        status_code=422,
        code="validation_error",
        message="Request validation failed",
        details=details,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "Unhandled application exception request_id=%s path=%s",
        _get_request_id(request),
        request.url.path,
        exc_info=exc,
    )
    return _error_response(
        request,
        status_code=500,
        code="internal_server_error",
        message="An unexpected error occurred",
    )


app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {"message": "Growlog backend running"}
