from .celery_app import celery
import uuid
from .models import FetchedData
from .database import SyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import insert
from datetime import datetime
from celery.schedules import crontab
import requests

# Keep track of which todo to fetch next (in a real app, persist this)
current_todo = 1


@celery.task
def add(x, y):
    return x + y


@celery.task
def fetch_and_save():
    global current_todo
    url = f"https://jsonplaceholder.typicode.com/todos/{current_todo}"
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        data = resp.json()
        db = SyncSessionLocal()
        row = FetchedData(
            id=str(uuid.uuid4()),
            url=url,
            user_id=data["userId"],
            todo_id=data["id"],
            title=data["title"],
            completed=data["completed"],
            fetched_at=datetime.utcnow(),
        )
        db.add(row)
        db.commit()
        db.close()
        print(f"Successfully fetched and saved todo {current_todo}")
    except Exception as e:
        print(f"Error in fetch_and_save for todo {current_todo}: {e}")
    current_todo += 1
    if current_todo > 200:  # jsonplaceholder has 200 todos
        current_todo = 1


# Schedule the task every 10 seconds for testing
celery.conf.beat_schedule = {
    "fetch-and-save-every-10-seconds": {
        "task": "app.tasks.fetch_and_save",
        "schedule": 30.0,  # every 30 seconds
    },
}
