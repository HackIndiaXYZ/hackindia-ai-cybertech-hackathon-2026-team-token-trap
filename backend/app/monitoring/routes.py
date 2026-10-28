from typing import Any, Optional

from fastapi import APIRouter, Depends, Query

from app.auth.routes import genuine_claims
from app.monitoring.events import get_monitoring_summary, list_events


router = APIRouter(prefix="/api/monitoring", tags=["Monitoring"])


@router.get("/events")
def get_security_events(
    limit: int = Query(default=50, ge=1, le=200),
    severity: Optional[str] = Query(default=None),
    event_type: Optional[str] = Query(default=None),
    environment: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    claims: dict[str, Any] = Depends(genuine_claims),
):
    """Retrieve bounded and filtered security events.
    
    Requires genuine administrator authentication.
    """
    events = list_events(
        limit=limit,
        severity=severity,
        event_type=event_type,
        environment=environment,
        search=search,
    )

    return {
        "count": len(events),
        "events": events,
    }


@router.get("/summary")
def get_summary_metrics(
    claims: dict[str, Any] = Depends(genuine_claims),
):
    """Retrieve security monitoring summary metrics and distribution counts.
    
    Requires genuine administrator authentication.
    """
    return get_monitoring_summary()