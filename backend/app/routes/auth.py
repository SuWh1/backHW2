from fastapi import APIRouter, HTTPException
from uuid import uuid4
from app.schemas import UserCreate, User
from app.models import UserDB
from app.database import SessionLocal
from app.auth import get_password_hash, verify_password, create_access_token
from sqlalchemy.future import select

router = APIRouter()

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    async with SessionLocal() as session:
        result = await session.execute(select(UserDB).where(UserDB.username == user.username))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already registered")
        user_id = str(uuid4())
        hashed = get_password_hash(user.password)
        db_user = UserDB(id=user_id, username=user.username, hashed_password=hashed)
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
        return User(id=db_user.id, username=db_user.username)

@router.post("/login")
async def login(user: UserCreate):
    async with SessionLocal() as session:
        result = await session.execute(select(UserDB).where(UserDB.username == user.username))
        db_user = result.scalar_one_or_none()
        if not db_user or not verify_password(user.password, db_user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect username or password")
        access_token = create_access_token({"sub": db_user.id})
        return {"access_token": access_token, "token_type": "bearer"} 