from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: str
    username: str

class TaskCreate(BaseModel):
    title: str
    description: str

class Task(BaseModel):
    id: str
    title: str
    description: str
    owner_id: Optional[str] = None 