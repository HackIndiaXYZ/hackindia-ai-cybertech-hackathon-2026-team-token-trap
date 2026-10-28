from fastapi import APIRouter, Depends
from typing import Any

from app.auth.routes import genuine_claims
from app.monitoring.events import list_events


router = APIRouter(prefix="/api/monitoring", tags=["Monitoring"])


@router.get("/events")
def get_security_events(
    limit: int = 25,
    claims: dict[str, Any] = Depends(genuine_claims),
):
    events = list_events(limit)

    return {
        "count": len(events),
        "events": events,
    }