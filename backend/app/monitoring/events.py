from datetime import datetime, timezone
from threading import Lock
from typing import Any
from collections import deque
import secrets


# In-memory demo event store.
# Replace with persistent storage before production deployment.
_events: deque[dict[str, Any]] = deque(maxlen=500)
_lock = Lock()


def record_event(
    event_type: str,
    severity: str,
    message: str,
    environment: str = "security",
) -> dict[str, Any]:
    event = {
        "id": secrets.token_hex(8),
        "event_type": event_type,
        "severity": severity,
        "message": message,
        "environment": environment,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    with _lock:
        _events.appendleft(event)

    return event.copy()


def list_events(limit: int = 50) -> list[dict[str, Any]]:
    limit = max(1, min(limit, 100))

    with _lock:
        return [event.copy() for event in list(_events)[:limit]]