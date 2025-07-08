from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.openai_client import get_openai_client

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat(req: ChatRequest):
    client = get_openai_client()
    if not client:
        raise HTTPException(500, "OpenAI API key not configured")
    try:
        resp = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": req.message}],
            temperature=0.3,
        )
        return {"answer": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(500, str(e))

