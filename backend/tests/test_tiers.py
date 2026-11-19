import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_tier_endpoints_and_switching():
    # 1. Fetch current plan
    res_curr = client.get("/api/tiers/current")
    assert res_curr.status_code == 200
    curr_data = res_curr.json()
    assert "current_tier" in curr_data
    assert "max_simulations" in curr_data

    # 2. Fetch all plans
    res_plans = client.get("/api/tiers/plans")
    assert res_plans.status_code == 200
    plans_data = res_plans.json()
    assert "plans" in plans_data
    plan_ids = [p["id"] for p in plans_data["plans"]]
    assert "FREE" in plan_ids
    assert "PRO" in plan_ids
    assert "INSTITUTIONAL" in plan_ids

    # 3. Switch to PRO tier
    res_switch = client.post("/api/tiers/switch", json={"tier": "PRO"})
    assert res_switch.status_code == 200
    assert res_switch.json()["plan"]["id"] == "PRO"
    assert res_switch.json()["plan"]["max_simulations"] == 2000

    # 4. Switch to INSTITUTIONAL tier
    res_inst = client.post("/api/tiers/switch", json={"tier": "INSTITUTIONAL"})
    assert res_inst.status_code == 200
    assert res_inst.json()["plan"]["id"] == "INSTITUTIONAL"
    assert res_inst.json()["plan"]["max_simulations"] == 10000

    # 5. Invalid tier switch fails
    res_invalid = client.post("/api/tiers/switch", json={"tier": "ULTRA_LEGENDARY"})
    assert res_invalid.status_code == 400

    # 6. Reset back to PRO for general tests
    client.post("/api/tiers/switch", json={"tier": "PRO"})
