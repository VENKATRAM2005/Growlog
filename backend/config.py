from __future__ import annotations

import logging
import os

logger = logging.getLogger("growlog.config")

PRODUCTION_ENVS = {"production", "staging"}
DEFAULT_DEV_DATABASE_URL = "postgresql://postgres:postgres123@localhost:5432/growlog"
DEFAULT_DEV_SECRET_KEY = "dev-insecure-change-me"


def _get_env_name() -> str:
    return os.getenv("GROWLOG_ENV", "development").strip().lower() or "development"


def _is_production_like(env_name: str) -> bool:
    return env_name in PRODUCTION_ENVS


ENVIRONMENT = _get_env_name()

_secret_key = os.getenv("GROWLOG_JWT_SECRET")
if not _secret_key:
    if _is_production_like(ENVIRONMENT):
        raise RuntimeError("GROWLOG_JWT_SECRET must be set outside development")
    logger.warning(
        "GROWLOG_JWT_SECRET is not set; using an insecure development fallback"
    )
    _secret_key = DEFAULT_DEV_SECRET_KEY

_database_url = os.getenv("GROWLOG_DATABASE_URL")
if not _database_url:
    if _is_production_like(ENVIRONMENT):
        raise RuntimeError("GROWLOG_DATABASE_URL must be set outside development")
    logger.warning(
        "GROWLOG_DATABASE_URL is not set; using the local development database URL"
    )
    _database_url = DEFAULT_DEV_DATABASE_URL

SECRET_KEY = _secret_key
ALGORITHM = os.getenv("GROWLOG_JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("GROWLOG_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)
DATABASE_URL = _database_url
LOG_LEVEL = os.getenv("GROWLOG_LOG_LEVEL", "INFO").upper()
ENABLE_GIT_PUSH = os.getenv("GROWLOG_ENABLE_GIT_PUSH", "true").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}
