# backend/app/api/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

RC_CLIENT_ID = os.getenv("RINGCENTRAL_CLIENT_ID")
RC_CLIENT_SECRET = os.getenv("RINGCENTRAL_CLIENT_SECRET")
RC_TOKEN_URL = "https://platform.ringcentral.com/restapi/oauth/token"

class TokenRequest(BaseModel):
    code: str
    redirect_uri: str

@router.post("/auth/token")
async def exchange_token(payload: TokenRequest):
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {
        "grant_type": "authorization_code",
        "code": payload.code,
        "redirect_uri": payload.redirect_uri
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                RC_TOKEN_URL,
                data=data,
                headers=headers,
                auth=(RC_CLIENT_ID, RC_CLIENT_SECRET)
            )
        response.raise_for_status()
        return response.json()

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Token exchange failed")

