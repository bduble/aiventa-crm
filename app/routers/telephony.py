from fastapi import APIRouter, HTTPException, Request, Response
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant
from twilio.request_validator import RequestValidator
import os
import logging

router = APIRouter()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_API_KEY_SID = os.getenv("TWILIO_API_KEY_SID")
TWILIO_API_KEY_SECRET = os.getenv("TWILIO_API_KEY_SECRET")
TWIML_APP_SID = os.getenv("TWIML_APP_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

validator = RequestValidator(TWILIO_AUTH_TOKEN) if TWILIO_AUTH_TOKEN else None
logger = logging.getLogger(__name__)

@router.get("/token")
def generate_token(identity: str):
    if not (TWILIO_ACCOUNT_SID and TWILIO_API_KEY_SID and TWILIO_API_KEY_SECRET and TWIML_APP_SID):
        raise HTTPException(500, "Twilio env vars not configured")
    token = AccessToken(TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, identity=identity)
    voice_grant = VoiceGrant(outgoing_application_sid=TWIML_APP_SID, incoming_allow=True)
    token.add_grant(voice_grant)
    return {"token": token.to_jwt().decode()}

@router.post("/voice")
async def inbound_call(request: Request):
    if validator and not validator.validate(str(request.url), await request.body(), request.headers.get("X-Twilio-Signature", "")):
        raise HTTPException(status_code=403, detail="Invalid signature")
    data = await request.form()
    logger.info(f"Inbound call from {data.get('From')} to {data.get('To')}")
    return Response("<Response><Say>Call received</Say></Response>", media_type="text/xml")

@router.post("/sms")
async def inbound_sms(request: Request):
    if validator and not validator.validate(str(request.url), await request.body(), request.headers.get("X-Twilio-Signature", "")):
        raise HTTPException(status_code=403, detail="Invalid signature")
    data = await request.form()
    logger.info(f"SMS from {data.get('From')}: {data.get('Body')}")
    return Response("<Response></Response>", media_type="text/xml")
