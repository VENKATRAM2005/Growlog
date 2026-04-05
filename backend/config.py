import os

# Centralized configuration. In production, set these environment variables:
# - GROWLOG_JWT_SECRET
# - GROWLOG_JWT_ALGORITHM
# - GROWLOG_ACCESS_TOKEN_EXPIRE_MINUTES
# - GROWLOG_DATABASE_URL
#
# Defaults are kept to match the current local dev setup.

SECRET_KEY = os.getenv("GROWLOG_JWT_SECRET", "supersecretkey123")
ALGORITHM = os.getenv("GROWLOG_JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("GROWLOG_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

DATABASE_URL = os.getenv(
    "GROWLOG_DATABASE_URL",
    "postgresql://postgres:postgres123@localhost:5432/growlog",
)