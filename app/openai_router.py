# app/openai_router.py  ← append this code at the bottom
from fastapi.responses import StreamingResponse
import asyncio

@router.get("/ask-stream")
async def ask_stream(q: str):
    """
    SSE endpoint that mirrors the /ask POST logic but streams tokens.
    Frontend calls:  GET /ai/ask-stream?q=<question>
    """
    question = q.strip()
    if not question:
        raise HTTPException(400, "Question missing")

    async def event_stream():
        # ── First pass: Let GPT decide if a tool is needed ───────────
        first = await openai.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0,
            functions=functions,
            messages=[
                {"role":"system",
                 "content":"You are aiVenta, the dealership’s expert assistant."},
                {"role":"user", "content": question}
            ],
            stream=False,
        )
        msg = first.choices[0].message

        # ── If a function is called, fetch data and do second pass ───
        if msg.function_call:
            fn_name = msg.function_call.name
            args = json.loads(msg.function_call.arguments)
            data = TOOLS[fn_name](args)

            second = await openai.chat.completions.create(
                model="gpt-4o-mini",
                temperature=0.4,
                messages=[
                  {"role":"system","content":"Answer using only the provided data."},
                  {"role":"user",   "content": question},
                  msg,
                  {"role":"tool", "name": fn_name,
                   "content": json.dumps(data)}
                ],
                stream=True,                       # <‑‑ stream this one
            )
        else:
            # No tool needed, just stream the first reply
            second = await openai.chat.completions.create(
                model="gpt-4o-mini",
                temperature=0.4,
                messages=[
                  {"role":"system",
                   "content":"You are aiVenta, the dealership’s expert assistant."},
                  {"role":"user", "content": question}
                ],
                stream=True,
            )

        # ── Forward each token chunk to the client ──────────────────
        async for chunk in second:
            if (tok := chunk.choices[0].delta.get("content")):
                yield f"data: {tok}\n\n"
            await asyncio.sleep(0)                # flush
        yield "data: [DONE]\n\n"

    headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    }
    return StreamingResponse(event_stream(), headers=headers)
