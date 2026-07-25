import asyncio
import json
import os
import tempfile
import unittest
from dataclasses import dataclass
from typing import Any
from unittest.mock import patch
from urllib.parse import urlencode

os.environ.setdefault("GROWLOG_DATABASE_URL", "sqlite:///:memory:")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend.main import app
from backend.utils.dependencies import get_db


@dataclass
class ASGIResponse:
    status_code: int
    headers: dict[str, str]
    content: bytes

    def json(self) -> Any:
        return json.loads(self.content.decode("utf-8"))

    @property
    def text(self) -> str:
        return self.content.decode("utf-8")


class SimpleASGITestClient:
    def __init__(self, asgi_app):
        self.app = asgi_app

    def get(self, path: str, headers: dict[str, str] | None = None) -> ASGIResponse:
        return self.request("GET", path, headers=headers)

    def post(
        self,
        path: str,
        *,
        json_body: dict[str, Any] | None = None,
        form_data: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> ASGIResponse:
        return self.request(
            "POST",
            path,
            json_body=json_body,
            form_data=form_data,
            headers=headers,
        )

    def put(
        self,
        path: str,
        headers: dict[str, str] | None = None,
    ) -> ASGIResponse:
        return self.request("PUT", path, headers=headers)

    def request(
        self,
        method: str,
        path: str,
        *,
        json_body: dict[str, Any] | None = None,
        form_data: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> ASGIResponse:
        if json_body is not None and form_data is not None:
            raise ValueError("Use either json_body or form_data, not both")

        body = b""
        request_headers: dict[str, str] = {"host": "testserver"}

        if json_body is not None:
            body = json.dumps(json_body).encode("utf-8")
            request_headers["content-type"] = "application/json"
        elif form_data is not None:
            body = urlencode(form_data).encode("utf-8")
            request_headers["content-type"] = (
                "application/x-www-form-urlencoded"
            )

        request_headers["content-length"] = str(len(body))

        if headers:
            request_headers.update(
                {key.lower(): value for key, value in headers.items()}
            )

        async def run_request() -> ASGIResponse:
            response_status = 500
            response_headers: dict[str, str] = {}
            response_body_parts: list[bytes] = []
            request_sent = False

            async def receive():
                nonlocal request_sent

                if request_sent:
                    return {"type": "http.disconnect"}

                request_sent = True

                return {
                    "type": "http.request",
                    "body": body,
                    "more_body": False,
                }

            async def send(message):
                nonlocal response_status, response_headers

                if message["type"] == "http.response.start":
                    response_status = message["status"]
                    response_headers = {
                        key.decode("latin-1"): value.decode("latin-1")
                        for key, value in message.get("headers", [])
                    }

                elif message["type"] == "http.response.body":
                    response_body_parts.append(message.get("body", b""))

            scope = {
                "type": "http",
                "asgi": {"version": "3.0"},
                "http_version": "1.1",
                "method": method,
                "scheme": "http",
                "path": path,
                "raw_path": path.encode("ascii"),
                "query_string": b"",
                "headers": [
                    (key.encode("latin-1"), value.encode("latin-1"))
                    for key, value in request_headers.items()
                ],
                "client": ("127.0.0.1", 123),
                "server": ("testserver", 80),
                "state": {},
            }

            await self.app(scope, receive, send)

            return ASGIResponse(
                status_code=response_status,
                headers=response_headers,
                content=b"".join(response_body_parts),
            )

        return asyncio.run(run_request())


class TaskApiIntegrationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = os.path.join(self.temp_dir.name, "integration.db")

        self.engine = create_engine(
            f"sqlite:///{db_path}",
            connect_args={"check_same_thread": False},
        )

        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine,
        )

        Base.metadata.create_all(bind=self.engine)

        def override_get_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        self.client = SimpleASGITestClient(app)

        self.log_patch = patch(
            "backend.services.task_service.regenerate_logs",
            return_value={
                "daily": [],
                "monthly": [],
                "target_date": "2026-04-05",
            },
        )
        self.log_patch.start()

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        self.log_patch.stop()
        self.engine.dispose()
        self.temp_dir.cleanup()

    def _register_and_login(
        self,
        username: str = "apiuser",
        password: str = "supersecure123",
    ) -> dict[str, str]:

        register_response = self.client.post(
            "/api/v1/register",
            json_body={
                "username": username,
                "password": password,
            },
        )
        self.assertEqual(register_response.status_code, 201)

        login_response = self.client.post(
            "/api/v1/login",
            form_data={
                "username": username,
                "password": password,
            },
        )
        self.assertEqual(login_response.status_code, 200)

        token = login_response.json()["access_token"]

        return {
            "Authorization": f"Bearer {token}"
        }

    def assert_error_response(
        self,
        response: ASGIResponse,
        *,
        status_code: int,
        code: str,
        message: str,
    ) -> None:

        self.assertEqual(response.status_code, status_code)
        self.assertIn("x-request-id", response.headers)

        body = response.json()

        self.assertEqual(body["error"]["code"], code)
        self.assertEqual(body["error"]["message"], message)
        self.assertEqual(
            body["error"]["request_id"],
            response.headers["x-request-id"],
        )

    def test_register_login_and_profile_roundtrip(self):
        headers = self._register_and_login()

        me_response = self.client.get(
            "/api/v1/user/me",
            headers=headers,
        )

        self.assertEqual(me_response.status_code, 200)
        self.assertIn("x-request-id", me_response.headers)
        self.assertEqual(me_response.json()["username"], "apiuser")
        self.assertIsNone(me_response.json()["github_repo"])

    def test_task_lifecycle_and_analytics_flow(self):
        headers = self._register_and_login()

        create_response = self.client.post(
            "/api/v1/tasks/create",
            json_body={
                "input_text": "deep work;\napi polish, Deep Work, system design"
            },
            headers=headers,
        )

        self.assertEqual(create_response.status_code, 201)

        pending_response = self.client.get(
            "/api/v1/tasks/pending",
            headers=headers,
        )

        first_task_id = pending_response.json()[0]["id"]

        self.client.put(
            f"/api/v1/tasks/complete/{first_task_id}",
            headers=headers,
        )

        self.client.put(
            f"/api/v1/tasks/complete/{first_task_id}",
            headers=headers,
        )

        completed_response = self.client.get(
            "/api/v1/tasks/completed",
            headers=headers,
        )

        self.assertEqual(completed_response.status_code, 200)

        analytics_response = self.client.get(
            "/api/v1/analytics/weekly",
            headers=headers,
        )

        self.assertEqual(analytics_response.status_code, 200)

    def test_task_creation_requires_authentication(self):
        response = self.client.post(
            "/api/v1/tasks/create",
            json_body={"input_text": "secure design review"},
        )

        self.assert_error_response(
            response,
            status_code=401,
            code="http_error",
            message="Not authenticated",
        )

    def test_task_creation_rejects_invalid_payload(self):
        headers = self._register_and_login()

        response = self.client.post(
            "/api/v1/tasks/create",
            json_body={"input_text": " , \n ; "},
            headers=headers,
        )

        self.assert_error_response(
            response,
            status_code=400,
            code="http_error",
            message="Provide at least one valid task title",
        )

    def test_validation_errors_have_consistent_envelope(self):
        response = self.client.post(
            "/api/v1/register",
            json_body={
                "username": "ab",
                "password": "short",
            },
        )

        self.assert_error_response(
            response,
            status_code=422,
            code="validation_error",
            message="Request validation failed",
        )