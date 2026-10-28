from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.auth.routes import router as auth_router
from app.monitoring.routes import router as monitoring_router


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Deception-based security monitoring API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router)
app.include_router(monitoring_router)


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
    return {
        "status": "healthy",
        "service": "tokentrap-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }