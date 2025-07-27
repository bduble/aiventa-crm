# app/routers/auth.py

import os
import bcrypt
import jwt
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# ── ENV & DB ──
load_dotenv()
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
JWT_SECRET = os.environ.get("JWT_SECRET", "change_me")
JWT_EXP = 7200  # 2 hours

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter()

# ── Models ──
class LoginRequest(BaseModel):
    identity: str
    password: str
    remember: bool = False

class LoginResponse(BaseModel):
    token: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    reset_code: str
    new_password: str

# ── Helpers ──
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_jwt(data: dict, expires_sec: int = JWT_EXP) -> str:
    payload = {**data, "exp": datetime.now(tz=timezone.utc) + timedelta(seconds=expires_sec)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def generate_reset_code(length=6):
    return ''.join(secrets.choice("0123456789") for _ in range(length))

def now_utc():
    return datetime.now(tz=timezone.utc)

# ── Routes ──

@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest):
    identity = data.identity
    if "@" in identity:
        user_resp = supabase.from_("users").select("*").eq("email", identity).single().execute()
    else:
        user_resp = supabase.from_("users").select("*").eq("username", identity).single().execute()
    user = user_resp.data
    if not user or not check_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_jwt(
        {
            "id": user["id"],
            "email": user["email"],
            "username": user.get("username"),
            "role": user["role"],
            "permissions": user["permissions"],
        },
        expires_sec=2592000 if data.remember else JWT_EXP
    )
    return {"token": token}

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    user_resp = supabase.from_("users").select("id, email").eq("email", data.email).single().execute()
    user = user_resp.data
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    reset_code = generate_reset_code()
    expires_at = (now_utc() + timedelta(minutes=15)).isoformat()
    supabase.from_("password_resets").insert({
        "email": data.email,
        "reset_code": reset_code,
        "expires_at": expires_at,
        "used": False,
    }).execute()
    print(f"Password reset code for {data.email}: {reset_code}")
    return {"message": "If this email exists, a reset code has been sent."}

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    now = now_utc().isoformat()
    resp = (
        supabase.from_("password_resets")
        .select("*")
        .eq("email", data.email)
        .eq("reset_code", data.reset_code)
        .eq("used", False)
        .lte("expires_at", now)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    record = resp.data[0] if resp.data else None
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")
    new_hash = hash_password(data.new_password)
    supabase.from_("users").update({"hashed_password": new_hash}).eq("email", data.email).execute()
    supabase.from_("password_resets").update({"used": True}).eq("id", record["id"]).execute()
    return {"message": "Password updated."}
