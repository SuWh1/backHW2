from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes.auth import router as auth_router
from app.routes.tasks import router as tasks_router
from app.redis_client import init_redis, close_redis

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await init_db()
    await init_redis()


@app.on_event("shutdown")
async def on_shutdown():
    await close_redis()


app.include_router(auth_router)
app.include_router(tasks_router)
