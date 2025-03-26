from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import re
import os
from dotenv import load_dotenv
from openai import OpenAI
import json

load_dotenv()
router = APIRouter()
security = HTTPBearer()

client = OpenAI()
RC_API_BASE = "https://platform.ringcentral.com/restapi/v1.0"

@router.post("/ai/command")
async def process_command(payload: dict, credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_input = payload.get("message", "")

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant for managing a RingCentral account. "
                        "When the user gives a command like forwarding calls, respond naturally but also include a JSON action block "
                        "like:\n\n```json\n{\"type\": \"callForwarding\", \"payload\": {\"destination\": \"+13035551234\"}}\n```"
                    )
                },
                {"role": "user", "content": user_input}
            ],
            temperature=0.4
        )

        ai_text = response.choices[0].message.content

        # Extract action from markdown JSON block (if present)
        action = None
        match = re.search(r'```json\s*({.*?})\s*```', ai_text, re.DOTALL)
        if match:
            try:
                action = json.loads(match.group(1))
            except Exception as e:
                print("Action parsing failed:", e)

        return {
            "response": ai_text,
            "action": action
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/execute")
async def execute_action(payload: dict, credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    action_type = payload.get("type")
    data = payload.get("payload", {})

    if action_type == "callForwarding":
        destination = data.get("destination")
        if not destination:
            raise HTTPException(status_code=400, detail="Missing destination number.")

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        try:
            # Step 1: Get the user's devices
            async with httpx.AsyncClient() as client:
                device_res = await client.get(f"{RC_API_BASE}/account/~/extension/~/device", headers=headers)
                device_res.raise_for_status()
                devices = device_res.json().get("records", [])

            if not devices:
                raise HTTPException(status_code=500, detail="No device found to associate forwarding number with.")

            device_id = devices[0].get("id")

            # Step 2: Create the forwarding number (omit device if using raw phone number)
            create_payload = {
                "phoneNumber": destination,
                "label": "AI Forward",
                "type": "Other"
            }

            async with httpx.AsyncClient() as client:
                create_res = await client.post(
                    f"{RC_API_BASE}/account/~/extension/~/forwarding-number",
                    headers=headers,
                    json=create_payload
                )
                create_res.raise_for_status()
                new_forwarding_number = create_res.json()

            forwarding_number_id = new_forwarding_number.get("id")

            # Step 3: Update answering rule (business hours)
            body = {
                "callHandlingAction": "ForwardCalls",
                "forwarding": {
                    "notifyMySoftPhones": True,
                    "notifyAdminSoftPhones": False,
                    "softPhonesRingCount": 3,
                    "rules": [
                        {
                            "index": 1,
                            "ringCount": 3,
                            "forwardingNumbers": [
                                {"id": forwarding_number_id}
                            ]
                        }
                    ]
                }
            }

            async with httpx.AsyncClient() as client:
                response = await client.put(
                    f"{RC_API_BASE}/account/~/extension/~/answering-rule/business-hours-rule",
                    headers=headers,
                    json=body
                )
                response.raise_for_status()

            return {"status": "success"}

        except httpx.HTTPStatusError as e:
            print("RingCentral API error:", e.response.status_code, await e.response.aread())
            raise HTTPException(status_code=500, detail="Failed to update call forwarding settings")

    raise HTTPException(status_code=400, detail="Unsupported action type")
