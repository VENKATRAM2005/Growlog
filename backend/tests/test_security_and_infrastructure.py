import importlib
import os
import unittest

from pydantic import ValidationError

from backend.schemas.repo import RepoInput
from backend.schemas.user import UserCreate
from backend.services.git_service import _resolve_user_repo_path


class SecurityAndInfrastructureTests(unittest.TestCase):
    def test_repo_url_normalizes_valid_github_remote(self) -> None:
        payload = RepoInput(repo_url="https://github.com/openai/growlog")
        self.assertEqual(payload.repo_url, "https://github.com/openai/growlog.git")

    def test_repo_url_rejects_non_github_hosts(self) -> None:
        with self.assertRaises(ValidationError):
            RepoInput(repo_url="https://example.com/openai/growlog.git")

    def test_repo_url_rejects_non_https(self) -> None:
        with self.assertRaises(ValidationError):
            RepoInput(repo_url="http://github.com/openai/growlog.git")

    def test_username_rejects_pathlike_values(self) -> None:
        with self.assertRaises(ValidationError):
            UserCreate(username="../escape", password="supersecure123")

    def test_user_repo_path_stays_within_workspace_root(self) -> None:
        with self.assertRaises(ValueError):
            _resolve_user_repo_path("..\\..\\outside")

    def test_production_requires_jwt_secret(self) -> None:
        original_env = os.environ.copy()
        try:
            os.environ["GROWLOG_ENV"] = "production"
            os.environ.pop("GROWLOG_JWT_SECRET", None)
            os.environ["GROWLOG_DATABASE_URL"] = "sqlite:///:memory:"
            with self.assertRaises(RuntimeError):
                import backend.config as config_module

                importlib.reload(config_module)
        finally:
            os.environ.clear()
            os.environ.update(original_env)
            import backend.config as config_module

            importlib.reload(config_module)


if __name__ == "__main__":
    unittest.main()
