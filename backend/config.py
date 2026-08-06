import os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / ".env")
DATABASE_URL = os.getenv("GROWLOG_DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("GROWLOG_DATABASE_URL is not set.")

ENVIRONMENT = os.getenv(
    "GROWLOG_ENV",
    "development",
)

SECRET_KEY = os.getenv(
    "GROWLOG_JWT_SECRET",
)

if ENVIRONMENT == "production" and not SECRET_KEY:
    raise RuntimeError("GROWLOG_JWT_SECRET must be set in production.")

if not SECRET_KEY:
    SECRET_KEY = "change-this-before-production"

ALGORITHM = os.getenv(
    "GROWLOG_JWT_ALGORITHM",
    "HS256",
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "GROWLOG_ACCESS_TOKEN_EXPIRE_MINUTES",
        "60",
    )
)

LOG_LEVEL = os.getenv(
    "GROWLOG_LOG_LEVEL",
    "INFO",
)

ENABLE_GIT_PUSH = (
    os.getenv("GROWLOG_ENABLE_GIT_PUSH", "false").strip().lower() == "true"
)

# Compatibility aliases
JWT_SECRET = SECRET_KEY
JWT_ALGORITHM = ALGORITHM
