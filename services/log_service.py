import os
from datetime import datetime
from sqlalchemy.orm import Session
from backend.models.task import Task

def generate_daily_log(db: Session, user):

    today = datetime.utcnow().date()

    # Create logs folder inside backend
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logs_dir = os.path.join(base_dir, "logs")

    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)

    file_path = os.path.join(logs_dir, f"{today}.txt")

    tasks = db.query(Task).filter(
        Task.user_id == user.id
    ).all()

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(f"{today}\n\n")
        f.write(f"  {user.username}:\n")

        for task in tasks:
            created_time = task.created_at.strftime("%I:%M %p")

            if task.status == "completed":
                completed_time = task.completed_at.strftime("%I:%M %p")
                f.write(f"    [{created_time}] - {task.title} ✔ (Completed at {completed_time})\n")
            else:
                f.write(f"    [{created_time}] - {task.title}\n")

    print("Log file generated at:", file_path)