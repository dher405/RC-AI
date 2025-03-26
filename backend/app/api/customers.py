# backend/app/api/customers.py

from fastapi import APIRouter, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends

router = APIRouter()
security = HTTPBearer()

# Temporary mock status (you’ll replace this with DB lookup or real logic later)
mock_customer_status = {
    "default": "TRIAL"
}

@router.get("/customers/status")
async def get_customer_status(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)  # ✅ THIS is the key fix
):
    token = credentials.credentials
    return { "state": "TRIAL" }

