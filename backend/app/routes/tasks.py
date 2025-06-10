from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas import Task, TaskCreate, User
from app.models import TaskDB
from app.database import SessionLocal
from app.auth import get_current_user

router = APIRouter()

@router.get("/me", response_model=User)
async def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/tasks", response_model=List[Task])
async def get_tasks(current_user: User = Depends(get_current_user)):
    async with SessionLocal() as session:
        result = await session.execute(
            TaskDB.__table__.select().where(TaskDB.owner_id == current_user.id)
        )
        tasks = result.fetchall()
        return [Task(id=row.id, title=row.title, description=row.description, owner_id=row.owner_id) for row in tasks]

@router.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate, current_user: User = Depends(get_current_user)):
    async with SessionLocal() as session:
        new_task = TaskDB(id=str(uuid4()), title=task.title, description=task.description, owner_id=current_user.id)
        session.add(new_task)
        await session.commit()
        await session.refresh(new_task)
        return Task(id=new_task.id, title=new_task.title, description=new_task.description, owner_id=new_task.owner_id)

@router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, updated: TaskCreate, current_user: User = Depends(get_current_user)):
    async with SessionLocal() as session:
        result = await session.execute(
            TaskDB.__table__.select().where(TaskDB.id == task_id, TaskDB.owner_id == current_user.id)
        )
        task = result.scalar_one_or_none()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found.")
        await session.execute(
            TaskDB.__table__.update().where(TaskDB.id == task_id).values(title=updated.title, description=updated.description)
        )
        await session.commit()
        return Task(id=task_id, title=updated.title, description=updated.description, owner_id=current_user.id)

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: User = Depends(get_current_user)):
    async with SessionLocal() as session:
        result = await session.execute(
            TaskDB.__table__.select().where(TaskDB.id == task_id, TaskDB.owner_id == current_user.id)
        )
        task = result.scalar_one_or_none()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found.")
        await session.execute(
            TaskDB.__table__.delete().where(TaskDB.id == task_id)
        )
        await session.commit()
        return {"ok": True} 