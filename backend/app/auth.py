import os
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Request, Depends
from .database import SessionLocal
from .models import UserDB
from .schemas import User
import json
from .redis_client import get_redis_client

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(request: Request):
    auth: str = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    token = auth.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    user_id = payload["sub"]
    redis_client = get_redis_client()
    # Try Redis first
    cached = await redis_client.get(f"user:id:{user_id}")
    if cached:
        user_obj = json.loads(cached)
        return User(id=user_obj["id"], username=user_obj["username"])
    async with SessionLocal() as session:
        result = await session.execute(
            UserDB.__table__.select().where(UserDB.id == user_id)
        )
        user = result.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
            )
        # Cache user
        user_data = {
            "id": user.id,
            "username": user.username,
            "hashed_password": user.hashed_password,
        }
        await redis_client.set(f"user:id:{user.id}", json.dumps(user_data))
        await redis_client.set(f"user:username:{user.username}", json.dumps(user_data))
        return User(id=user.id, username=user.username)
