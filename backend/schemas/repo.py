from __future__ import annotations

from urllib.parse import urlparse

from pydantic import BaseModel, Field, field_validator


class RepoInput(BaseModel):
    repo_url: str = Field(min_length=1, max_length=500)

    @field_validator("repo_url")
    @classmethod
    def validate_repo_url(cls, value: str) -> str:
        normalized = value.strip()
        parsed = urlparse(normalized)

        if parsed.scheme != "https":
            raise ValueError("Repository URL must use https")
        if parsed.netloc not in {"github.com", "www.github.com"}:
            raise ValueError("Only GitHub repository URLs are supported")

        path = parsed.path.removeprefix("/").removesuffix(".git")
        parts = [part for part in path.split("/") if part]
        if len(parts) != 2 or not all(parts):
            raise ValueError("Repository URL must target a GitHub owner/repository")

        owner, repo = parts
        return f"https://github.com/{owner}/{repo}.git"
