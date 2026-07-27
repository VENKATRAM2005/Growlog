import os

# Force a lightweight database for test discovery before backend modules import
# configuration and create the global SQLAlchemy engine.
os.environ.setdefault("GROWLOG_DATABASE_URL", "sqlite:///:memory:")
