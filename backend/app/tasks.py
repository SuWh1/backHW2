from .celery_app import celery
import aiohttp
import asyncio
import uuid
from .models import FetchedData
from .database import SessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import insert
from datetime import datetime
from celery.schedules import crontab


@celery.task
def add(x, y):
    return x + y


@celery.task
def fetch_and_save():
    # Run the async part in an event loop
    asyncio.run(_fetch_and_save())


async def _fetch_and_save():
    url = "https://jsonplaceholder.typicode.com/todos/1"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            content = await resp.text()
    async with SessionLocal() as db:
        data = FetchedData(
            id=str(uuid.uuid4()), url=url, content=content, fetched_at=datetime.utcnow()
        )
        db.add(data)
        await db.commit()


# Schedule the task every minute for testing
celery.conf.beat_schedule = {
    "fetch-and-save-every-minute": {
        "task": "app.tasks.fetch_and_save",
        "schedule": 60.0,  # every minute
    },
}
