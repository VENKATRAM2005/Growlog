import os
import unittest
from datetime import datetime, timedelta

os.environ.setdefault("GROWLOG_DATABASE_URL", "sqlite:///:memory:")

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend.models.task import Task, TaskStatus
from backend.models.user import User
from backend.routers.analytics import weekly_analytics
from backend.routers.tasks import complete_task, create_tasks
from backend.schemas.task import TaskCreateRequest
from backend.services import task_service


class AnalyticsAndTasksTests(unittest.TestCase):
    def setUp(self) -> None:
        # Use an in-memory DB for fast, isolated tests.
        self.engine = create_engine("sqlite:///:memory:")
        self.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )
        Base.metadata.create_all(bind=self.engine)

        self.db = self.SessionLocal()

        self.user = User(
            username="testuser",
            password_hash="x",
            github_repo=None,
        )
        self.db.add(self.user)
        self.db.commit()
        self.db.refresh(self.user)

    def tearDown(self) -> None:
        self.db.close()

    def test_weekly_analytics_bins_and_counts(self) -> None:
        today = datetime.utcnow().date()

        # Pending: arbitrary extra.
        pending_task = Task(
            title="Pending one",
            user_id=self.user.id,
            status=TaskStatus.PENDING,
            created_at=datetime.utcnow(),
        )
        self.db.add(pending_task)

        # Completed: one task per day for the last 7 days.
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            completed_task = Task(
                title=f"Task {day.isoformat()}",
                user_id=self.user.id,
                status=TaskStatus.COMPLETED,
                created_at=datetime(day.year, day.month, day.day, 9, 0, 0),
                completed_at=datetime(day.year, day.month, day.day, 12, 0, 0),
            )
            self.db.add(completed_task)

        self.db.commit()

        res = weekly_analytics(db=self.db, current_user=self.user)

        self.assertEqual(len(res["completed_counts"]), 7)
        self.assertEqual(res["today_completed"], res["completed_counts"][-1])
        self.assertEqual(res["pending_count"], 1)
        self.assertEqual(sum(res["completed_counts"]), 7)

    def test_complete_task_returns_404_for_missing_task(self) -> None:
        with self.assertRaises(HTTPException) as ctx:
            complete_task(task_id=999999, db=self.db, current_user=self.user)

        self.assertEqual(ctx.exception.status_code, 404)

    def test_parse_task_titles_normalizes_and_deduplicates(self) -> None:
        titles = task_service.parse_task_titles(" dsa , api, DSA, system design ")
        self.assertEqual(titles, ["Dsa", "Api", "System Design"])

    def test_parse_task_titles_supports_newlines_and_semicolons(self) -> None:
        titles = task_service.parse_task_titles("deep work;\napi polish, system design")
        self.assertEqual(titles, ["Deep Work", "Api Polish", "System Design"])

    def test_parse_task_titles_rejects_empty_payload(self) -> None:
        with self.assertRaises(HTTPException) as ctx:
            task_service.parse_task_titles(" ,   , ")

        self.assertEqual(ctx.exception.status_code, 400)

    def test_parse_task_titles_rejects_too_many_items(self) -> None:
        payload = ",".join(
            f"task {index}" for index in range(task_service.MAX_TASKS_PER_REQUEST + 1)
        )

        with self.assertRaises(HTTPException) as ctx:
            task_service.parse_task_titles(payload)

        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("no more than", ctx.exception.detail.lower())

    def test_parse_task_titles_rejects_overlong_title(self) -> None:
        with self.assertRaises(HTTPException) as ctx:
            task_service.parse_task_titles(
                "x" * (task_service.MAX_TASK_TITLE_LENGTH + 1)
            )

        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("at most", ctx.exception.detail.lower())

    def test_complete_task_is_idempotent_after_first_completion(self) -> None:
        task = Task(
            title="Ship metrics",
            user_id=self.user.id,
            status=TaskStatus.PENDING,
            created_at=datetime.utcnow(),
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)

        first_result = complete_task(
            task_id=task.id, db=self.db, current_user=self.user
        )
        second_result = complete_task(
            task_id=task.id, db=self.db, current_user=self.user
        )

        self.assertEqual(first_result["message"], "Task completed")
        self.assertFalse(first_result["already_completed"])
        self.assertEqual(second_result["message"], "Task already completed")
        self.assertTrue(second_result["already_completed"])
        self.assertEqual(second_result["task"].status, "completed")

    def test_create_tasks_for_user_creates_normalized_records(self) -> None:
        tasks = task_service.create_tasks_for_user(
            self.db, self.user, "deep work,   docs, Deep Work"
        )

        self.assertEqual([task.title for task in tasks], ["Deep Work", "Docs"])

        pending = self.db.query(Task).filter(Task.user_id == self.user.id).all()
        self.assertEqual(len(pending), 2)

    def test_create_tasks_route_returns_summary_from_typed_payload(self) -> None:
        result = create_tasks(
            payload=TaskCreateRequest(input_text="deep work, docs"),
            db=self.db,
            current_user=self.user,
        )

        self.assertEqual(result["tasks_created"], ["Deep Work", "Docs"])
        self.assertEqual(result["total_created"], 2)


if __name__ == "__main__":
    unittest.main()
