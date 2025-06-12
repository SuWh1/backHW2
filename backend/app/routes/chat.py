from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini import generate_gemini_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/gemini-chat", response_model=ChatResponse)
async def chat_with_gemini(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    reply = generate_gemini_response(request.message)
    return {"response": reply}
