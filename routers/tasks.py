from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.task import Task
from backend.services.log_service import generate_daily_log
from backend.utils.dependencies import get_current_user, get_db
from datetime import datetime

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/create")
def create_tasks(input_text: str, 
                 db: Session = Depends(get_db),
                 current_user = Depends(get_current_user)):

    task_titles = [t.strip() for t in input_text.split(",") if t.strip()]

    created_tasks = []

    for title in task_titles:
        task = Task(
            title=title,
            user_id=current_user.id,
            status="pending",
            created_at=datetime.utcnow()
        )
        db.add(task)
        created_tasks.append(title)

    db.commit()
    generate_daily_log(db, current_user)

    return {"tasks_created": created_tasks}


@router.get("/pending")
def get_pending_tasks(db: Session = Depends(get_db),
                      current_user = Depends(get_current_user)):

    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "pending"
    ).all()

    return tasks

@router.put("/complete/{task_id}")
def complete_task(task_id: int,
                  db: Session = Depends(get_db),
                  current_user = Depends(get_current_user)):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        return {"error": "Task not found"}

    task.status = "completed"
    task.completed_at = datetime.utcnow()

    db.commit()
    generate_daily_log(db, current_user)

    return {"message": "Task completed"}
