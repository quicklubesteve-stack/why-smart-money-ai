import datetime
import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.config import settings
from app.database import SessionLocal
from app.services.calendar_service import calendar_service
from app.services.report_generator import market_brief_generator
from app.services.news_service import news_service
from app.services.notifications.telegram_dispatcher import telegram_dispatcher

scheduler = AsyncIOScheduler(timezone=pytz.timezone(settings.APP_TIMEZONE))

async def run_5am_morning_brief_job():
    """
    Scheduled job triggered at 5:00 AM America/Toronto time on weekdays.
    """
    toronto_now = calendar_service.get_toronto_now()
    today_date = toronto_now.date()
    cal_status = calendar_service.get_market_status(today_date)

    print(f"[{toronto_now.isoformat()}] Triggering 5:00 AM America/Toronto Market Intelligence cycle...")

    if not cal_status["is_any_market_open"]:
        print(f"[{toronto_now.isoformat()}] Neither US nor Canadian markets open today. Skipping 5 AM run.")
        return

    db = SessionLocal()
    try:
        brief_data = market_brief_generator.generate_and_store_brief(
            db=db,
            session_type="5AM_PREMARKET",
            target_date=today_date.strftime("%Y-%m-%d")
        )
        print(f"[{toronto_now.isoformat()}] 5 AM Brief successfully generated. SHA-256: {brief_data['immutable_hash'][:16]}...")

        # Refresh daily 5 AM stock news and tactical decision playbook
        news_items = news_service.seed_and_refresh_news(db)
        print(f"[{toronto_now.isoformat()}] Refreshed {len(news_items)} stock news intelligence articles for 5:00 AM cycle.")

        # Dispatch Telegram summary with deduplication
        alert_text = telegram_dispatcher.format_morning_brief_alert(brief_data)
        dispatch_result = await telegram_dispatcher.send_message(alert_text)
        print(f"[{toronto_now.isoformat()}] Telegram Dispatch: {dispatch_result['status']}")
    except Exception as e:
        print(f"Error executing 5:00 AM scheduler job: {e}")
    finally:
        db.close()

async def run_915am_refresh_job():
    """
    Pre-open refresh triggered at 9:15 AM America/Toronto time ahead of 9:30 AM regular session.
    """
    toronto_now = calendar_service.get_toronto_now()
    today_date = toronto_now.date()
    cal_status = calendar_service.get_market_status(today_date)

    if not cal_status["is_any_market_open"]:
        return

    print(f"[{toronto_now.isoformat()}] Executing 9:15 AM pre-open signal refresh...")
    db = SessionLocal()
    try:
        market_brief_generator.generate_and_store_brief(
            db=db,
            session_type="915AM_REFRESH",
            target_date=today_date.strftime("%Y-%m-%d")
        )
    except Exception as e:
        print(f"Error executing 9:15 AM refresh job: {e}")
    finally:
        db.close()

def start_scheduler():
    """Registers cron triggers and starts APScheduler in the background."""
    if scheduler.running:
        return

    # Trigger 1: 5:00 AM America/Toronto on Monday through Friday
    scheduler.add_job(
        run_5am_morning_brief_job,
        trigger=CronTrigger(hour=5, minute=0, day_of_week="mon-fri", timezone=pytz.timezone(settings.APP_TIMEZONE)),
        id="job_5am_morning_brief",
        replace_existing=True,
        name="Daily 5:00 AM America/Toronto Market Brief"
    )

    # Trigger 2: 9:15 AM America/Toronto on Monday through Friday
    scheduler.add_job(
        run_915am_refresh_job,
        trigger=CronTrigger(hour=9, minute=15, day_of_week="mon-fri", timezone=pytz.timezone(settings.APP_TIMEZONE)),
        id="job_915am_pre_open_refresh",
        replace_existing=True,
        name="Pre-open 9:15 AM Signal Refresh"
    )

    try:
        import asyncio
        asyncio.get_running_loop()
        scheduler.start()
        print(f"APScheduler initialized in timezone '{settings.APP_TIMEZONE}'. Jobs registered: 5:00 AM & 9:15 AM.")
    except RuntimeError:
        # In test runners or sync initializers without an active async event loop,
        # jobs remain registered on the scheduler instance
        pass

def stop_scheduler():
    try:
        if scheduler.running:
            scheduler.shutdown(wait=False)
    except (RuntimeError, Exception):
        pass

def get_scheduler_status():
    jobs = []
    if scheduler.running:
        for j in scheduler.get_jobs():
            next_run = j.next_run_time.isoformat() if j.next_run_time else None
            jobs.append({
                "id": j.id,
                "name": j.name,
                "next_run_time": next_run
            })

    return {
        "scheduler_running": scheduler.running,
        "timezone": settings.APP_TIMEZONE,
        "current_toronto_time": calendar_service.get_toronto_now().isoformat(),
        "registered_jobs": jobs
    }
