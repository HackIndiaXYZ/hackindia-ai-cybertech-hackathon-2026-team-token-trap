from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select

from app.config import settings
from app.auth.routes import router as auth_router
from app.monitoring.routes import router as monitoring_router
from app.ai.routes import router as ai_router
from app.database.connection import SessionLocal, check_db_health, init_db, is_postgres
from app.database.models import User, SecurityEvent, DecoyResource, DecoySession, AiConversation
from app.database.seed import seed_database

logger = logging.getLogger("tokentrap.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and default records on startup
    try:
        init_db()
        seed_database()
        logger.info("Database initialized and default seeds applied.")
    except Exception as exc:
        logger.warning("Database startup initialization notice: %s", exc)
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Deception-based security monitoring API.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router)
app.include_router(monitoring_router)
app.include_router(ai_router)


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "message": "TokenTrap API is running",
        "documentation": "/docs",
    }


@app.get("/api/health")
async def health():
    db_status = check_db_health()
    return {
        "status": "healthy",
        "service": "tokentrap-backend",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/database/status")
async def database_status():
    """Detailed PostgreSQL database statistics and connectivity state."""
    db_health = check_db_health()
    counts = {}

    try:
        with SessionLocal() as db:
            counts["users"] = db.execute(select(func.count(User.id))).scalar_one() or 0
            counts["security_events"] = db.execute(select(func.count(SecurityEvent.id))).scalar_one() or 0
            counts["decoy_resources"] = db.execute(select(func.count(DecoyResource.id))).scalar_one() or 0
            counts["decoy_sessions"] = db.execute(select(func.count(DecoySession.session_id))).scalar_one() or 0
            counts["ai_conversations"] = db.execute(select(func.count(AiConversation.id))).scalar_one() or 0
    except Exception as exc:
        counts["error"] = str(exc)

    return {
        "database_health": db_health,
        "is_postgres": is_postgres,
        "tables": counts,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }