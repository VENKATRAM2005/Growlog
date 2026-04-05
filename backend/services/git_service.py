import os
import subprocess


BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_REPO_DIR = os.path.join(BACKEND_DIR, "user_repos")


def _run_git(args: list[str], cwd: str) -> subprocess.CompletedProcess:
    # Best-effort automation: keep git output for debugging, but don't crash the API.
    return subprocess.run(args, cwd=cwd, check=False, capture_output=True, text=True)


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

    user_repo_path = os.path.join(BASE_REPO_DIR, username)
    user_logs_path = os.path.join(user_repo_path, "logs")
    os.makedirs(user_logs_path, exist_ok=True)
    os.makedirs(user_repo_path, exist_ok=True)

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