from fastapi import FastAPI
from backend.database import engine, Base
from backend.models.user import User
from backend.models.task import Task
from backend.routers import auth, tasks

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/")
def root():
    return {"message": "Growlog backend running"}