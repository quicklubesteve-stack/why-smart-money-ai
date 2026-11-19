from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.tier_service import tier_service, TIER_PLANS

router = APIRouter(prefix="/api/tiers", tags=["tiers"])

class SwitchTierRequest(BaseModel):
    tier: str

@router.get("/current")
def get_current_tier():
    return tier_service.get_current_plan()

@router.get("/plans")
def get_tier_plans():
    return {
        "current_tier": tier_service.get_current_tier(),
        "plans": tier_service.get_all_plans()
    }

@router.post("/switch")
def switch_active_tier(req: SwitchTierRequest):
    try:
        updated_plan = tier_service.set_current_tier(req.tier)
        return {
            "status": "success",
            "message": f"Active tier switched to {updated_plan['name']}",
            "plan": updated_plan
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
