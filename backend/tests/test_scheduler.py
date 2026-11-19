import pytest
from app.services.scheduler import start_scheduler, get_scheduler_status, stop_scheduler

@pytest.mark.asyncio
async def test_scheduler_jobs_and_timezone():
    start_scheduler()
    status = get_scheduler_status()

    assert status["timezone"] == "America/Toronto"
    assert len(status["registered_jobs"]) >= 2

    job_ids = [j["id"] for j in status["registered_jobs"]]
    assert "job_5am_morning_brief" in job_ids
    assert "job_915am_pre_open_refresh" in job_ids
