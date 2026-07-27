import os

DATABASE_URL = os.getenv(
    "GROWLOG_DATABASE_URL",
    "sqlite:///./growlog.db",
)

SECRET_KEY = os.getenv(
    "GROWLOG_JWT_SECRET",
    "change-this-before-production",
)

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

ENVIRONMENT = os.getenv(
    "GROWLOG_ENV",
    "development",
)

LOG_LEVEL = os.getenv(
    "GROWLOG_LOG_LEVEL",
    "INFO",
)

# Backward-compatible aliases
JWT_SECRET = SECRET_KEY
JWT_ALGORITHM = ALGORITHM