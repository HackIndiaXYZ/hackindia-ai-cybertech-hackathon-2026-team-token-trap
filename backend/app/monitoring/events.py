from __future__ import annotations

from collections import deque
from datetime import datetime, timedelta, timezone
import secrets
from threading import Lock
from typing import Any, Optional


# In-memory demo event store and active decoy session store.
# Bounded to prevent memory exhaustion in demo environments.
_events: deque[dict[str, Any]] = deque(maxlen=1000)
_active_decoy_sessions: dict[str, datetime] = {}
_lock = Lock()

SESSION_TIMEOUT_MINUTES = 15


def record_event(
    event_type: str,
    severity: str,
    message: str,
    environment: str = "security",
    session_id: Optional[str] = None,
    source: Optional[str] = "127.0.0.1",
) -> dict[str, Any]:
    """Record a security event.
    
    Security note: Passwords, password hashes, JWTs, and raw Authorization
    headers must NEVER be passed to or stored by this function.
    """
    clean_severity = severity.lower().strip()
    if clean_severity not in {"critical", "high", "medium", "low", "info"}:
        clean_severity = "medium"

    event: dict[str, Any] = {
        "id": f"EVT-{secrets.token_hex(4).upper()}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_type": str(event_type).strip(),
        "severity": clean_severity,
        "environment": str(environment).strip(),
        "message": str(message).strip(),
        "session_id": str(session_id) if session_id else None,
        "source": str(source) if source else "127.0.0.1",
    }

    with _lock:
        _events.appendleft(event)

    return event.copy()


def list_events(
    limit: int = 50,
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    environment: Optional[str] = None,
    search: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Return bounded and filterable security events."""
    limit = max(1, min(limit, 200))

    with _lock:
        results = [event.copy() for event in _events]

    # Severity filter
    if severity and severity.upper() != "ALL":
        target_sev = severity.lower().strip()
        results = [e for e in results if e["severity"] == target_sev]

    # Event type filter
    if event_type and event_type.upper() != "ALL":
        target_type = event_type.lower().strip()
        results = [e for e in results if e["event_type"].lower() == target_type]

    # Environment filter
    if environment and environment.upper() != "ALL":
        target_env = environment.lower().strip()
        results = [e for e in results if e["environment"].lower() == target_env]

    # Search query filter
    if search and search.strip():
        q = search.strip().lower()
        results = [
            e
            for e in results
            if q in e["id"].lower()
            or q in e["message"].lower()
            or q in e["event_type"].lower()
            or q in e["environment"].lower()
            or (e.get("source") and q in e["source"].lower())
        ]

    return results[:limit]


def register_decoy_session(session_id: str) -> None:
    """Register or refresh an active decoy session timestamp."""
    now = datetime.now(timezone.utc)
    with _lock:
        _active_decoy_sessions[session_id] = now
        _cleanup_expired_decoy_sessions_locked(now)


def unregister_decoy_session(session_id: str) -> None:
    """End an active decoy session on logout."""
    with _lock:
        _active_decoy_sessions.pop(session_id, None)


def _cleanup_expired_decoy_sessions_locked(now: datetime) -> None:
    """Purge sessions older than timeout threshold."""
    cutoff = now - timedelta(minutes=SESSION_TIMEOUT_MINUTES)
    expired = [
        sid
        for sid, last_seen in _active_decoy_sessions.items()
        if last_seen < cutoff
    ]
    for sid in expired:
        _active_decoy_sessions.pop(sid, None)


def get_active_decoy_sessions_count() -> int:
    """Return current count of unexpired decoy sessions."""
    now = datetime.now(timezone.utc)
    with _lock:
        _cleanup_expired_decoy_sessions_locked(now)
        return len(_active_decoy_sessions)


def get_monitoring_summary() -> dict[str, Any]:
    """Calculate live dashboard metrics derived from recorded events."""
    with _lock:
        snapshot = [e.copy() for e in _events]
        active_decoy_count = len(_active_decoy_sessions)

    # Count derived metrics
    auth_attempts = 0
    successful_logins = 0
    failed_logins = 0
    honey_activations = 0
    blocked_requests = 0
    high_severity_count = 0

    severity_dist: dict[str, int] = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "info": 0,
    }
    type_dist: dict[str, int] = {}

    for e in snapshot:
        etype = e.get("event_type", "")
        sev = e.get("severity", "medium").lower()

        # Severity breakdown
        if sev in severity_dist:
            severity_dist[sev] += 1
        if sev in {"critical", "high"}:
            high_severity_count += 1

        # Type breakdown
        type_dist[etype] = type_dist.get(etype, 0) + 1

        # Metric classifications per README specifications
        if etype in {"login_succeeded", "login_failed"}:
            auth_attempts += 1

        if etype == "login_succeeded":
            successful_logins += 1
        elif etype == "login_failed":
            failed_logins += 1

        # Honey-token / decoy resource interactions
        if etype in {
            "decoy_token_activation",
            "decoy_document_access",
            "decoy_resource_activated",
            "honey_credential_activated",
        }:
            honey_activations += 1

        # Blocked / rejected requests
        if etype in {
            "genuine_access_rejected",
            "decoy_access_rejected",
            "blocked_api_request",
            "rate_limit_exceeded",
        }:
            blocked_requests += 1

    # Build recent activity timeline buckets
    # Group into 6 recent 10-minute bins
    now = datetime.now(timezone.utc)
    timeline: list[dict[str, Any]] = []
    for i in range(5, -1, -1):
        slot_start = now - timedelta(minutes=(i + 1) * 10)
        slot_end = now - timedelta(minutes=i * 10)
        time_label = slot_end.strftime("%H:%M")

        slot_attempts = sum(
            1
            for e in snapshot
            if e.get("event_type") in {"login_succeeded", "login_failed"}
            and slot_start <= datetime.fromisoformat(e["timestamp"]) <= slot_end
        )
        slot_detected = sum(
            1
            for e in snapshot
            if e.get("severity") in {"high", "critical"}
            and slot_start <= datetime.fromisoformat(e["timestamp"]) <= slot_end
        )

        timeline.append({
            "time": time_label,
            "attempts": slot_attempts,
            "detected": slot_detected,
        })

    return {
        "metrics": {
            "authentication_attempts": auth_attempts,
            "honey_token_activations": honey_activations,
            "active_decoy_sessions": active_decoy_count,
            "blocked_api_requests": blocked_requests,
            "successful_logins": successful_logins,
            "failed_logins": failed_logins,
            "high_severity_events": high_severity_count,
            "total_events": len(snapshot),
        },
        "severity_distribution": severity_dist,
        "event_type_distribution": type_dist,
        "timeline": timeline,
        "timestamp": now.isoformat(),
    }