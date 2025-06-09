import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, Text
import asyncio

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/postgres")

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

class TaskDB(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

class Task(BaseModel):
    id: str
    title: str
    description: str

class TaskCreate(BaseModel):
    title: str
    description: str

app = FastAPI()

app.add_middleware( 
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/tasks", response_model=List[Task])
async def get_tasks():
    async with SessionLocal() as session:
        result = await session.execute(
            TaskDB.__table__.select()
        )
        tasks = result.fetchall()

        return [Task(id=row.id, title=row.title, description=row.description) for row in tasks]

@app.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    async with SessionLocal() as session:
        new_task = TaskDB(id=str(uuid4()), title=task.title, description=task.description)
        session.add(new_task)
        await session.commit()
        await session.refresh(new_task)

        return Task(id=new_task.id, title=new_task.title, description=new_task.description)

@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, updated: TaskCreate):
    async with SessionLocal() as session:
        result = await session.execute(
            TaskDB.__table__.select().where(TaskDB.id == task_id)
        )
        task = result.scalar_one_or_none()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found.")
        await session.execute(
            TaskDB.__table__.update().where(TaskDB.id == task_id).values(title=updated.title, description=updated.description)
        )
        await session.commit()

        return Task(id=task_id, title=updated.title, description=updated.description)

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    async with SessionLocal() as session:
        result = await session.execute(
            TaskDB.__table__.select().where(TaskDB.id == task_id)
        )
        task = result.scalar_one_or_none()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found.")
        await session.execute(
            TaskDB.__table__.delete().where(TaskDB.id == task_id)
        )
        await session.commit()

        return {"ok": True} 