from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import openai

api_key = os.environ.get("OPENAI_API_KEY")
openai_client = openai.AsyncOpenAI(api_key=api_key) if api_key else None

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat(req: ChatRequest):
    if not openai_client:
        raise HTTPException(500, "OpenAI API key not configured")
    try:
        resp = await openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": req.message}],
            temperature=0.3,
        )
        return {"answer": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(500, str(e))

