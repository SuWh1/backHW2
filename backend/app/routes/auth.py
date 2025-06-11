from fastapi import APIRouter, HTTPException
from uuid import uuid4
from app.schemas import UserCreate, User
from app.models import UserDB
from app.database import SessionLocal
from app.auth import get_password_hash, verify_password, create_access_token
from sqlalchemy.future import select
import json
from app.redis_client import get_redis_client

router = APIRouter()


@router.post("/register", response_model=User)
async def register(user: UserCreate):
    redis_client = get_redis_client()
    # Check Redis for username
    cached = await redis_client.get(f"user:username:{user.username}")
    if cached:
        raise HTTPException(
            status_code=400, detail="Username already registered (cache)"
        )
    async with SessionLocal() as session:
        result = await session.execute(
            select(UserDB).where(UserDB.username == user.username)
        )
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already registered")
        user_id = str(uuid4())
        hashed = get_password_hash(user.password)
        db_user = UserDB(id=user_id, username=user.username, hashed_password=hashed)
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
        # Cache user by username and id
        user_data = {
            "id": db_user.id,
            "username": db_user.username,
            "hashed_password": db_user.hashed_password,
        }
        await redis_client.set(
            f"user:username:{db_user.username}", json.dumps(user_data)
        )
        await redis_client.set(f"user:id:{db_user.id}", json.dumps(user_data))
        return User(id=db_user.id, username=db_user.username)


@router.post("/login")
async def login(user: UserCreate):
    redis_client = get_redis_client()
    # Try Redis first
    cached = await redis_client.get(f"user:username:{user.username}")
    db_user = None
    if cached:
        user_obj = json.loads(cached)
        if verify_password(user.password, user_obj["hashed_password"]):
            db_user = user_obj
    if not db_user:
        async with SessionLocal() as session:
            result = await session.execute(
                select(UserDB).where(UserDB.username == user.username)
            )
            db_user_obj = result.scalar_one_or_none()
            if not db_user_obj or not verify_password(
                user.password, db_user_obj.hashed_password
            ):
                raise HTTPException(
                    status_code=400, detail="Incorrect username or password"
                )
            db_user = {
                "id": db_user_obj.id,
                "username": db_user_obj.username,
                "hashed_password": db_user_obj.hashed_password,
            }
            # Cache user
            await redis_client.set(
                f"user:username:{db_user_obj.username}", json.dumps(db_user)
            )
            await redis_client.set(f"user:id:{db_user_obj.id}", json.dumps(db_user))
    access_token = create_access_token({"sub": db_user["id"]})
    return {"access_token": access_token, "token_type": "bearer"}
