from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from app.db import supabase
from twilio.rest import Client as TwilioClient
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os

router = APIRouter()

class BulkTextRequest(BaseModel):
    ids: list[str]
    message: str

class BulkEmailRequest(BaseModel):
    ids: list[str]
    subject: str
    body: str

def get_customers_by_ids(ids: list[str]):
    # Fetch customers from Supabase
    resp = supabase.table('customers').select('*').in_('id', ids).execute()
    if resp.error:
        raise HTTPException(status_code=500, detail=resp.error.message)
    return resp.data

@router.post("/bulk/text")
async def bulk_text(req: BulkTextRequest):
    customers = get_customers_by_ids(req.ids)
    twilio_client = TwilioClient(os.getenv("TWILIO_SID"), os.getenv("TWILIO_TOKEN"))
    from_number = os.getenv("TWILIO_FROM")
    sent, failed = 0, 0
    for c in customers:
        if not c.get("phone"):
            continue
        try:
            twilio_client.messages.create(
                body=req.message,
                to=c["phone"],
                from_=from_number
            )
            sent += 1
        except Exception as e:
            failed += 1
    return {"sent": sent, "failed": failed}

@router.post("/bulk/email")
async def bulk_email(req: BulkEmailRequest):
    customers = get_customers_by_ids(req.ids)
    sg = SendGridAPIClient(os.getenv("SENDGRID_KEY"))
    from_email = os.getenv("SENDGRID_FROM")
    sent, failed = 0, 0
    for c in customers:
        if not c.get("email"):
            continue
        try:
            mail = Mail(
                from_email=from_email,
                to_emails=c["email"],
                subject=req.subject,
                html_content=req.body
            )
            sg.send(mail)
            sent += 1
        except Exception as e:
            failed += 1
    return {"sent": sent, "failed": failed}
