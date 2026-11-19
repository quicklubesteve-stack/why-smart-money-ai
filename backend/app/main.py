from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
from app.config import settings

from app.routers import (
    scanner, stocks, smart_money, signals, predictions,
    market_brief, portfolio, performance, providers, simulation, tiers
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    # Start APScheduler in background
    from app.services.scheduler import start_scheduler, stop_scheduler
    start_scheduler()

    yield

    stop_scheduler()

app = FastAPI(
    title="Why Smart Money AI - Quantitative Market Intelligence API",
    description="Institutional-grade stock market analysis engine for US (NYSE, NASDAQ) and Canadian (TSX) equities.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scanner.router)
app.include_router(stocks.router)
app.include_router(smart_money.router)
app.include_router(signals.router)
app.include_router(predictions.router)
app.include_router(market_brief.router)
app.include_router(portfolio.router)
app.include_router(performance.router)
app.include_router(providers.router)
app.include_router(simulation.router)
app.include_router(tiers.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "why-smart-money-api",
        "demo_mode": settings.is_demo_mode,
        "timezone": settings.APP_TIMEZONE,
        "environment": settings.ENVIRONMENT
    }

@app.get("/api/scheduler/status")
def get_scheduler_info():
    from app.services.scheduler import get_scheduler_status
    return get_scheduler_status()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
