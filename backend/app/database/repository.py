from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

from app.database.models import (
    AiConversation,
    DecoyResource,
    DecoySession,
    SandboxAuditLog,
    SecurityEvent,
    User,
)


# ============================================================================
# User Operations
# ============================================================================

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve user record by email."""
    stmt = select(User).where(func.lower(User.email) == email.lower().strip())
    return db.execute(stmt).scalar_one_or_none()


def create_user(
    db: Session,
    email: str,
    password_hash: str,
    role: str = "admin",
    account_mode: str = "genuine",
    is_active: bool = True,
) -> User:
    """Create or update a user record."""
    user = get_user_by_email(db, email)
    if user:
        user.password_hash = password_hash
        user.role = role
        user.account_mode = account_mode
        user.is_active = is_active
        user.updated_at = datetime.now(timezone.utc)
    else:
        user = User(
            email=email.strip().lower(),
            password_hash=password_hash,
            role=role,
            account_mode=account_mode,
            is_active=is_active,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session) -> list[User]:
    """List all registered users."""
    stmt = select(User).order_by(User.id.asc())
    return list(db.execute(stmt).scalars().all())


# ============================================================================
# Security Events Operations
# ============================================================================

def save_security_event(db: Session, event_data: dict[str, Any]) -> SecurityEvent:
    """Persist an audit/security event into the database."""
    # Ensure no sensitive tokens or password data are recorded
    clean_details = dict(event_data.get("details") or {})
    for secret_key in ("password", "password_hash", "token", "jwt", "authorization"):
        clean_details.pop(secret_key, None)

    ts = event_data.get("timestamp")
    parsed_ts = datetime.fromisoformat(ts) if isinstance(ts, str) else datetime.now(timezone.utc)

    event = SecurityEvent(
        id=str(event_data.get("id")),
        event_type=str(event_data.get("event_type")),
        severity=str(event_data.get("severity", "medium")).lower(),
        environment=str(event_data.get("environment", "security")),
        message=str(event_data.get("message", "")),
        session_id=str(event_data["session_id"]) if event_data.get("session_id") else None,
        source=str(event_data.get("source", "127.0.0.1")),
        details=clean_details,
        timestamp=parsed_ts,
    )
    db.merge(event)
    db.commit()
    return event


def list_security_events(
    db: Session,
    limit: int = 50,
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    environment: Optional[str] = None,
    search: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Query security events with multi-criteria filtering."""
    limit = max(1, min(limit, 200))
    stmt = select(SecurityEvent).order_by(desc(SecurityEvent.timestamp))

    if severity and severity.upper() != "ALL":
        stmt = stmt.where(SecurityEvent.severity == severity.lower().strip())

    if event_type and event_type.upper() != "ALL":
        stmt = stmt.where(func.lower(SecurityEvent.event_type) == event_type.lower().strip())

    if environment and environment.upper() != "ALL":
        stmt = stmt.where(func.lower(SecurityEvent.environment) == environment.lower().strip())

    if search and search.strip():
        q = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(SecurityEvent.id).like(q),
                func.lower(SecurityEvent.message).like(q),
                func.lower(SecurityEvent.event_type).like(q),
                func.lower(SecurityEvent.environment).like(q),
                func.lower(SecurityEvent.source).like(q),
            )
        )

    stmt = stmt.limit(limit)
    events = db.execute(stmt).scalars().all()
    return [e.to_dict() for e in events]


def get_monitoring_summary_db(db: Session) -> dict[str, Any]:
    """Derive real-time SOC metrics from persistent database events."""
    events = list(db.execute(select(SecurityEvent).order_by(desc(SecurityEvent.timestamp)).limit(1000)).scalars().all())
    
    # Active decoy sessions count
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(minutes=15)
    active_sessions_count = db.execute(
        select(func.count(DecoySession.session_id))
        .where(DecoySession.is_active == True)
        .where(DecoySession.last_seen_at >= cutoff)
    ).scalar_one() or 0

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

    for e in events:
        etype = e.event_type
        sev = e.severity.lower()

        if sev in severity_dist:
            severity_dist[sev] += 1
        if sev in {"critical", "high"}:
            high_severity_count += 1

        type_dist[etype] = type_dist.get(etype, 0) + 1

        if etype in {"login_succeeded", "login_failed"}:
            auth_attempts += 1
        if etype == "login_succeeded":
            successful_logins += 1
        elif etype == "login_failed":
            failed_logins += 1

        if etype in {
            "decoy_token_activation",
            "decoy_document_access",
            "decoy_resource_activated",
            "honey_credential_activated",
            "honey_canary_token_tripped",
            "sandbox_database_accessed",
            "sandbox_sql_query_executed",
            "sandbox_sql_injection_detected",
            "sandbox_data_exfiltration_attempt",
        }:
            honey_activations += 1

        if etype in {
            "genuine_access_rejected",
            "decoy_access_rejected",
            "blocked_api_request",
            "rate_limit_exceeded",
            "sandbox_sql_injection_detected",
        }:
            blocked_requests += 1

    # Timeline buckets for dashboard chart
    def _in_slot(event_ts: Optional[datetime], start: datetime, end: datetime) -> bool:
        if not event_ts:
            return False
        ts = event_ts.replace(tzinfo=timezone.utc) if event_ts.tzinfo is None else event_ts
        return start <= ts <= end

    timeline: list[dict[str, Any]] = []
    for i in range(5, -1, -1):
        slot_start = now - timedelta(minutes=(i + 1) * 10)
        slot_end = now - timedelta(minutes=i * 10)
        time_label = slot_end.strftime("%H:%M")

        slot_attempts = sum(
            1
            for e in events
            if e.event_type in {"login_succeeded", "login_failed"}
            and _in_slot(e.timestamp, slot_start, slot_end)
        )
        slot_detected = sum(
            1
            for e in events
            if e.severity in {"high", "critical"}
            and _in_slot(e.timestamp, slot_start, slot_end)
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
            "active_decoy_sessions": active_sessions_count,
            "blocked_api_requests": blocked_requests,
            "successful_logins": successful_logins,
            "failed_logins": failed_logins,
            "high_severity_events": high_severity_count,
            "total_events": len(events),
        },
        "severity_distribution": severity_dist,
        "event_type_distribution": type_dist,
        "timeline": timeline,
        "timestamp": now.isoformat(),
    }


# ============================================================================
# Decoy Resources (Canaries) Operations
# ============================================================================

def get_decoy_resource(db: Session, resource_id: str) -> Optional[DecoyResource]:
    """Fetch decoy resource by ID."""
    stmt = select(DecoyResource).where(DecoyResource.id == resource_id)
    return db.execute(stmt).scalar_one_or_none()


def list_decoy_resources(db: Session) -> list[DecoyResource]:
    """List all configured synthetic decoy resources."""
    stmt = select(DecoyResource).order_by(DecoyResource.id.asc())
    return list(db.execute(stmt).scalars().all())


def record_canary_activation(db: Session, resource_id: str) -> Optional[DecoyResource]:
    """Increment canary hit counter and timestamp."""
    resource = get_decoy_resource(db, resource_id)
    if not resource:
        return None
    resource.activation_count += 1
    resource.last_activated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(resource)
    return resource


def upsert_decoy_resource(
    db: Session,
    resource_id: str,
    name: str,
    resource_type: str,
    classification: str,
    fake_path: str,
    canary_token: str,
    metadata_json: Optional[dict[str, Any]] = None,
) -> DecoyResource:
    """Create or update a decoy resource."""
    res = get_decoy_resource(db, resource_id)
    if res:
        res.name = name
        res.resource_type = resource_type
        res.classification = classification
        res.fake_path = fake_path
        res.canary_token = canary_token
        res.metadata_json = metadata_json or {}
    else:
        res = DecoyResource(
            id=resource_id,
            name=name,
            resource_type=resource_type,
            classification=classification,
            fake_path=fake_path,
            canary_token=canary_token,
            metadata_json=metadata_json or {},
            created_at=datetime.now(timezone.utc),
        )
        db.add(res)
    db.commit()
    db.refresh(res)
    return res


# ============================================================================
# Decoy Sessions Operations
# ============================================================================

def register_decoy_session(
    db: Session,
    session_id: str,
    subject: str,
    client_ip: str = "127.0.0.1",
    user_agent: Optional[str] = None,
    timeout_minutes: int = 15,
) -> DecoySession:
    """Register or refresh an active decoy session."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=timeout_minutes)

    stmt = select(DecoySession).where(DecoySession.session_id == session_id)
    sess = db.execute(stmt).scalar_one_or_none()

    if sess:
        sess.last_seen_at = now
        sess.expires_at = expires_at
        sess.is_active = True
    else:
        sess = DecoySession(
            session_id=session_id,
            subject=subject,
            client_ip=client_ip,
            user_agent=user_agent,
            environment="decoy_sandbox",
            is_active=True,
            created_at=now,
            last_seen_at=now,
            expires_at=expires_at,
        )
        db.add(sess)
    db.commit()
    db.refresh(sess)
    return sess


def terminate_decoy_session(db: Session, session_id: str) -> bool:
    """Mark a decoy session as inactive upon logout or ejection."""
    stmt = select(DecoySession).where(DecoySession.session_id == session_id)
    sess = db.execute(stmt).scalar_one_or_none()
    if sess:
        sess.is_active = False
        db.commit()
        return True
    return False


# ============================================================================
# AI Conversation Operations
# ============================================================================

def log_ai_conversation(
    db: Session,
    prompt: str,
    response: str,
    model: str = "gemini-2.5-flash",
    source: str = "gemini",
    user_email: Optional[str] = None,
) -> AiConversation:
    """Persist an AI Copilot interaction for SOC audit logging."""
    record = AiConversation(
        user_email=user_email,
        prompt=prompt,
        response=response,
        model=model,
        source=source,
        created_at=datetime.now(timezone.utc),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_ai_conversations(db: Session, limit: int = 20) -> list[AiConversation]:
    """Retrieve recent AI Copilot conversations."""
    stmt = select(AiConversation).order_by(desc(AiConversation.created_at)).limit(limit)
    return list(db.execute(stmt).scalars().all())


# ============================================================================
# Sandbox Database Audit Operations (Visitor Tracking)
# ============================================================================

def log_sandbox_action(
    db: Session,
    session_id: str,
    visitor_email: str,
    action_type: str,
    target_table: str,
    query_text: Optional[str] = None,
    canary_token_tripped: Optional[str] = None,
    client_ip: str = "127.0.0.1",
    user_agent: Optional[str] = None,
    rows_returned: int = 0,
    severity: str = "high",
) -> SandboxAuditLog:
    """Record an intruder action, SQL query, or canary tripwire in the sandbox database."""
    log = SandboxAuditLog(
        session_id=session_id,
        visitor_email=visitor_email,
        action_type=action_type,
        target_table=target_table,
        query_text=query_text,
        canary_token_tripped=canary_token_tripped,
        client_ip=client_ip,
        user_agent=user_agent,
        rows_returned=rows_returned,
        severity=severity,
        created_at=datetime.now(timezone.utc),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def list_sandbox_audit_logs(
    db: Session,
    limit: int = 50,
    session_id: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Retrieve recent intruder audit records from the sandbox database."""
    stmt = select(SandboxAuditLog).order_by(desc(SandboxAuditLog.created_at))
    if session_id:
        stmt = stmt.where(SandboxAuditLog.session_id == session_id)
    stmt = stmt.limit(limit)
    records = db.execute(stmt).scalars().all()
    return [r.to_dict() for r in records]
