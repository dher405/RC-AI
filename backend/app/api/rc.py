from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx

router = APIRouter()
security = HTTPBearer()

RC_API_BASE = "https://platform.ringcentral.com/restapi/v1.0"

# ✅ This function turns RingCentral's call handling config into flowchart data
def map_call_handling_to_flow(data: dict):
    nodes = []
    edges = []

    nodes.append({
        "id": "calledNumber",
        "type": "input",
        "data": { "label": "Called Number" },
        "position": { "x": 0, "y": 100 }
    })

    nodes.append({
        "id": "forwarding",
        "data": { "label": "Forwarding Rules" },
        "position": { "x": 250, "y": 100 }
    })

    edges.append({ "id": "e-called-forwarding", "source": "calledNumber", "target": "forwarding" })

    phones = data.get("forwarding", {}).get("rules", [])[0].get("forwardingNumbers", [])
    for idx, phone in enumerate(phones):
        phone_id = phone["phoneNumber"]
        y = 50 + idx * 100
        nodes.append({
            "id": phone_id,
            "data": { "label": f"{phone['label']}: {phone['phoneNumber']}" },
            "position": { "x": 500, "y": y }
        })
        edges.append({ "id": f"e-forwarding-{phone_id}", "source": "forwarding", "target": phone_id })

        if data.get("voicemail", {}).get("enabled", False):
            if not any(n["id"] == "voicemail" for n in nodes):
                nodes.append({
                    "id": "voicemail",
                    "type": "output",
                    "data": { "label": "Voicemail" },
                    "position": { "x": 750, "y": 100 }
                })
            edges.append({ "id": f"e-{phone_id}-voicemail", "source": phone_id, "target": "voicemail" })

    return { "nodes": nodes, "edges": edges }

# ✅ Final endpoint
@router.get("/rc/call-flow")
async def get_call_flow(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    headers = {
        "Authorization": f"Bearer {token}"
    }

    account_id = "946947011"
    extension_id = "946953011"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{RC_API_BASE}/account/{account_id}/extension/{extension_id}/answering-rule",
            headers=headers
        )
        try:
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            print("RingCentral API error:", e.response.status_code, await e.response.aread())
            raise HTTPException(status_code=e.response.status_code, detail="Failed to fetch call flow")


# Test Endpoint
@router.get("/rc/me")
async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    headers = {
        "Authorization": f"Bearer {token}"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{RC_API_BASE}/account/~/extension/~", headers=headers)
    response.raise_for_status()
    return response.json()


