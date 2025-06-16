import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import create_engine

# Load environment variables from .env file
load_dotenv()

DATABASE_URL_BASE = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")

engine = create_async_engine(
    DATABASE_URL_BASE.replace("postgresql://", "postgresql+asyncpg://"),
    echo=True,
    connect_args={"ssl": False} 
)
SessionLocal = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)
Base = declarative_base()

sync_engine = create_engine(
    DATABASE_URL_BASE.replace("postgresql+asyncpg://", "postgresql://"),
    connect_args={"ssl": False}
)
SyncSessionLocal = sessionmaker(bind=sync_engine)



async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# Add this to ensure new tables are created
async def migrate():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
