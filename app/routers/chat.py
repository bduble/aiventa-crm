from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.openai_client import get_openai_client, get_openai_prompt

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat(req: ChatRequest):
    client = get_openai_client()
    if not client:
        raise HTTPException(500, "OpenAI API key not configured")

    prompt_def = get_openai_prompt()
    if not prompt_def:
        raise HTTPException(500, "OpenAI prompt ID not configured")

    try:
        resp = await client.responses.create(
            prompt=prompt_def,
            model="gpt-3.5-turbo",
            temperature=0.3,
            inputs={ "message": req.message }
        )
        return {"answer": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(500, str(e))


