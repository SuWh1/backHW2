from sqlalchemy import Column, String, Text, ForeignKey, Boolean, Integer, DateTime
from .database import Base
from datetime import datetime


class UserDB(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)


class TaskDB(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)


class FetchedData(Base):
    __tablename__ = "fetched_data"
    id = Column(String, primary_key=True, index=True)
    url = Column(String(255), nullable=False)
    user_id = Column(Integer, nullable=False)
    todo_id = Column(Integer, nullable=False)
    title = Column(Text, nullable=False)
    completed = Column(Boolean, nullable=False)
    fetched_at = Column(DateTime, default=datetime.utcnow)
