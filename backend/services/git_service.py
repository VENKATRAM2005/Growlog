from __future__ import annotations

import logging
import os
import subprocess
from pathlib import Path

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_REPO_DIR = os.path.join(BACKEND_DIR, "user_repos")
GIT_COMMAND_TIMEOUT_SECONDS = 15
logger = logging.getLogger("growlog.git")


def _run_git(args: list[str], cwd: str) -> subprocess.CompletedProcess:
    # Keep git automation bounded so requests do not hang indefinitely.
    result = subprocess.run(
        args,
        cwd=cwd,
        check=False,
        capture_output=True,
        text=True,
        timeout=GIT_COMMAND_TIMEOUT_SECONDS,
    )
    if result.returncode != 0:
        logger.warning(
            "git command failed args=%s cwd=%s returncode=%s stderr=%s",
            args,
            cwd,
            result.returncode,
            (result.stderr or "").strip(),
        )
    return result


def _resolve_user_repo_path(username: str) -> str:
    base_path = Path(BASE_REPO_DIR).resolve()
    candidate = (base_path / username).resolve()
    if os.path.commonpath([str(base_path), str(candidate)]) != str(base_path):
        raise ValueError("Resolved repository path escaped the allowed directory")
    return str(candidate)


def git_commit_and_push(
    repo_url: str,
    username: str,
    message: str,
    *,
    branch_preference: str = "main",
) -> None:
    """
    Init repo (if needed), set remote, commit log changes, push.
    Assumes your machine already has credentials configured for `repo_url`.
    """

    if not repo_url:
        return

    user_repo_path = _resolve_user_repo_path(username)
    user_logs_path = os.path.join(user_repo_path, "logs")
    os.makedirs(user_logs_path, exist_ok=True)
    os.makedirs(user_repo_path, exist_ok=True)

    try:
        if not os.path.exists(os.path.join(user_repo_path, ".git")):
            _run_git(["git", "init"], cwd=user_repo_path)

        # Ensure a working local branch exists.
        _run_git(["git", "checkout", "-B", branch_preference], cwd=user_repo_path)

        # Refresh remote URL.
        _run_git(["git", "remote", "remove", "origin"], cwd=user_repo_path)
        _run_git(["git", "remote", "add", "origin", repo_url], cwd=user_repo_path)

        # Stage only logs.
        _run_git(["git", "add", "logs"], cwd=user_repo_path)

        status = _run_git(["git", "status", "--porcelain"], cwd=user_repo_path)
        if not status.stdout.strip():
            return

        _run_git(["git", "commit", "-m", message], cwd=user_repo_path)

        push = _run_git(
            ["git", "push", "-u", "origin", branch_preference],
            cwd=user_repo_path,
        )
        if push.returncode == 0:
            return

        _run_git(["git", "push", "-u", "origin", "master"], cwd=user_repo_path)
    except (subprocess.TimeoutExpired, ValueError):
        logger.exception("git sync failed for user=%s repo=%s", username, repo_url)
