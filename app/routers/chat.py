from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import openai

openai.api_key = os.environ.get("OPENAI_API_KEY")

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat(req: ChatRequest):
    if not openai.api_key:
        raise HTTPException(500, "OpenAI API key not configured")
    try:
        resp = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": req.message}],
            temperature=0.3,
        )
        return {"answer": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(500, str(e))

