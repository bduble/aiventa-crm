# app/openai_router.py
from fastapi import APIRouter, HTTPException, Request
from openai import OpenAI, OpenAIError
from supabase import create_client
import json, os

router = APIRouter(prefix="/ai")
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
supabase = create_client(os.getenv("SUPABASE_URL"),
                         os.getenv("SUPABASE_KEY"))

# 1️⃣ declare callable tools
functions = [
  {
    "name": "get_inventory",
    "description": "Fetch vehicles from inventory",
    "parameters": {
      "type": "object",
      "properties": {
        "model":   {"type":"string"},
        "max_price":{"type":"number"},
        "limit":   {"type":"integer", "default": 5}
      },
      "required": ["model"]
    }
  },
  {
    "name": "get_best_contacts",
    "description": "Return contacts sorted by likelihood to buy soon",
    "parameters": {
      "type": "object",
      "properties": {
        "segment": {"type":"string",
                    "description":"e.g. 'service_due', 'hot_leads'" },
        "limit": {"type":"integer","default":10}
      },
      "required":["segment"]
    }
  }
]

# 2️⃣ tool runners
def get_inventory(args):
    q = supabase.from_("inventory") \
        .select("stock,vin,year,make,model,trim,internet_price,miles") \
        .ilike("model", f"%{args['model']}%") \
        .lte("internet_price", args.get("max_price", 999999)) \
        .limit(args.get("limit", 5)) \
        .execute()
    return q.data

def get_best_contacts(args):
    # toy scoring: recent activity + lead_score
    rows = supabase.rpc("rank_contacts",   # define in Postgres if you like
                        {"segment": args["segment"],
                         "limit_num": args.get("limit", 10)}).execute()
    return rows.data

TOOLS = {
  "get_inventory": get_inventory,
  "get_best_contacts": get_best_contacts,
}

@router.post("/ask")
async def ask(request: Request):
    body = await request.json()
    question = body.get("question","").strip()
    if not question:
        raise HTTPException(400, "Question missing")

    # 3️⃣ 1st pass – let GPT pick a tool
    first = await openai.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        functions=functions,
        messages=[
            {"role":"system",
             "content":"You are aiVenta, the dealership’s expert assistant."},
            {"role":"user", "content": question}
        ]
    )

    msg = first.choices[0].message
    if msg.function_call:
        fn_name = msg.function_call.name
        args = json.loads(msg.function_call.arguments)
        data = TOOLS[fn_name](args)

        # 4️⃣ second pass – answer with data
        second = await openai.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.4,
            messages=[
              {"role":"system","content":"Answer using only the provided data."},
              {"role":"user",   "content": question},
              msg,                                        # function call
              {"role":"tool", "name": fn_name,
               "content": json.dumps(data)}
            ]
        )
        answer = second.choices[0].message.content.strip()
        return {"answer": answer}

    # fallback: GPT didn’t need data
    return {"answer": msg.content.strip()}
