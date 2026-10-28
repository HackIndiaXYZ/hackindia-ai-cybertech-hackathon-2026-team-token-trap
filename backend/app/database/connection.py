from __future__ import annotations

import logging
from typing import Generator
import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.database.models import Base

logger = logging.getLogger("tokentrap.database")

# Resolve DB URL
DATABASE_URL = os.getenv("DATABASE_URL") or settings.database_url or "postgresql+psycopg://postgres:postgres@localhost:5432/tokentrap"

# Configure engine with robust fallback
engine = None
is_postgres = False

try:
    if "postgresql" in DATABASE_URL:
        # PostgreSQL with psycopg 3
        engine = create_engine(
            DATABASE_URL,
            echo=settings.database_echo,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            connect_args={"connect_timeout": 3},
        )
        # Attempt immediate verification ping
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        is_postgres = True
        logger.info("Connected successfully to PostgreSQL database at %s", DATABASE_URL.split("@")[-1])
    else:
        engine = create_engine(DATABASE_URL, echo=settings.database_echo)
        is_postgres = False
except Exception as e:
    logger.warning(
        "Could not connect to configured database (%s): %s. Falling back to local SQLite database for development resilience.",
        DATABASE_URL,
        str(e),
    )
    # Resilient SQLite fallback ensures zero disruption during hackathon demos and unit tests
    FALLBACK_DB_URL = "sqlite:///./tokentrap_dev.db"
    engine = create_engine(
        FALLBACK_DB_URL,
        connect_args={"check_same_thread": False},
        echo=settings.database_echo,
    )
    is_postgres = False

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> bool:
    """Create all database tables if they do not exist."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
        return True
    except Exception as exc:
        logger.error("Failed to initialize database schema: %s", exc)
        return False


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for obtaining a thread-safe database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_health() -> dict[str, str | bool]:
    """Inspect database connectivity and dialect for health checks."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "dialect": engine.dialect.name,
            "is_postgres": engine.dialect.name == "postgresql",
        }
    except Exception as exc:
        return {
            "status": "error",
            "error": str(exc),
            "dialect": engine.dialect.name if engine else "unknown",
            "is_postgres": False,
        }
