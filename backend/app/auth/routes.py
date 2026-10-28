from __future__ import annotations

from datetime import datetime, timedelta, timezone
from threading import Lock
from typing import Any, Literal, Optional
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import VerificationError
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field

from app.auth.tokens import issue_token, verify_token
from app.config import settings
from app.monitoring.events import (
    record_event,
    register_decoy_session,
    unregister_decoy_session,
)


router = APIRouter(prefix="/api", tags=["Security"])

password_hasher = PasswordHasher()

# Valid synthetic resources that can be interacted with / activated
VALID_DECOY_RESOURCES: dict[str, dict[str, str]] = {
    "DECOY-001": {
        "id": "DECOY-001",
        "name": "Confidential_Strategy_DRAFT.pdf",
        "type": "document",
        "classification": "SIMULATED DECOY DATA",
        "preview": "Simulated Executive Strategy 2026: Q3 Decentralized Canary Framework (Honey-Document).",
    },
    "DECOY-002": {
        "id": "DECOY-002",
        "name": "Internal_Credentials_Archive.txt",
        "type": "credentials",
        "classification": "SIMULATED DECOY DATA",
        "preview": "CANARY ARCHIVE: synthetic-db-user: simulated_pwd_token_trap_canary_99",
    },
    "DECOY-003": {
        "id": "DECOY-003",
        "name": "Synthetic_Database_Backup.sql",
        "type": "database_dump",
        "classification": "SIMULATED DECOY DATA",
        "preview": "-- SIMULATED POSTGRES DUMP\n-- TABLE decoy_customers (id, token_hash, synthetic_flag);",
    },
    "HONEY-CRED-01": {
        "id": "HONEY-CRED-01",
        "name": "Decoy Service Account Key",
        "type": "service_token",
        "classification": "SIMULATED DECOY DATA",
        "preview": "tokentrap_canary_key_sec_99a8b7c6d5e4f3",
    },
}

# In-memory failure tracking for repeated failure detection
_failed_attempts: dict[str, list[datetime]] = {}
_fail_lock = Lock()
MAX_FAILURES = 5
FAILURE_WINDOW_SECONDS = 60


def _track_and_check_rate_limit(client_id: str) -> bool:
    """Track failed login attempts and flag repeated failures."""
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=FAILURE_WINDOW_SECONDS)
    with _fail_lock:
        timestamps = _failed_attempts.setdefault(client_id, [])
        # Prune old timestamps
        _failed_attempts[client_id] = [t for t in timestamps if t > cutoff]
        _failed_attempts[client_id].append(now)
        return len(_failed_attempts[client_id]) > MAX_FAILURES


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=1024)
    mode: Optional[Literal["real", "decoy"]] = None


def get_bearer_token(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    scheme, separator, token = authorization.partition(" ")

    if (
        not separator
        or scheme.lower() != "bearer"
        or not token.strip()
        or " " in token.strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token.strip()


def genuine_claims(
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    token = get_bearer_token(authorization)

    try:
        return verify_token(token, "genuine")
    except HTTPException:
        record_event(
            event_type="genuine_access_rejected",
            severity="high",
            message="A request failed genuine-token verification.",
            environment="genuine",
        )
        raise


def decoy_claims(
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    token = get_bearer_token(authorization)

    try:
        return verify_token(token, "decoy")
    except HTTPException:
        record_event(
            event_type="decoy_access_rejected",
            severity="medium",
            message="A request failed decoy-token verification.",
            environment="decoy",
        )
        raise


@router.post("/auth/login")
def login(request: LoginRequest, raw_req: Request):
    email = str(request.email).strip().lower()
    client_ip = raw_req.client.host if raw_req.client else "127.0.0.1"

    # Determine mode: either explicitly requested or inferred from matching configured email
    token_type: str
    configured_email: Optional[str]
    password_hash: Optional[str]

    if request.mode == "real":
        configured_email = settings.admin_email
        password_hash = settings.admin_password_hash
        token_type = "genuine"
    elif request.mode == "decoy":
        configured_email = settings.decoy_email
        password_hash = settings.decoy_password_hash
        token_type = "decoy"
    else:
        # Auto-detect mode based on configured email
        if settings.admin_email and email == settings.admin_email.strip().lower():
            configured_email = settings.admin_email
            password_hash = settings.admin_password_hash
            token_type = "genuine"
        elif settings.decoy_email and email == settings.decoy_email.strip().lower():
            configured_email = settings.decoy_email
            password_hash = settings.decoy_password_hash
            token_type = "decoy"
        else:
            # Fallback to genuine check
            configured_email = settings.admin_email
            password_hash = settings.admin_password_hash
            token_type = "genuine"

    # Fail safely if the selected account has not been configured
    if not configured_email or not password_hash:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Login is not configured for this account mode.",
        )

    # Email and password must both match the account
    email_matches = email == configured_email.strip().lower()

    try:
        password_matches = password_hasher.verify(
            password_hash,
            request.password,
        )
    except VerificationError:
        password_matches = False

    if not email_matches or not password_matches:
        # Check repeated failure rate limit
        exceeded = _track_and_check_rate_limit(f"{client_ip}:{email}")
        if exceeded:
            record_event(
                event_type="blocked_api_request",
                severity="high",
                message=f"Repeated login failures threshold reached for {email}.",
                environment=token_type,
                source=client_ip,
            )

        record_event(
            event_type="login_failed",
            severity="medium",
            message="A login attempt failed credential verification.",
            environment=token_type,
            source=client_ip,
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue token
    session_id = secrets.token_hex(12)

    token = issue_token(
        subject=email,
        token_type=token_type,
        extra_claims={
            "email": email,
            "role": "admin" if token_type == "genuine" else "decoy",
            "session_id": session_id,
        },
    )

    record_event(
        event_type="login_succeeded",
        severity="low",
        message=f"A {token_type} account authenticated successfully.",
        environment=token_type,
        session_id=session_id,
        source=client_ip,
    )

    if token_type == "decoy":
        # Register decoy session and record decoy_session_started
        register_decoy_session(session_id)
        record_event(
            event_type="decoy_session_started",
            severity="medium",
            message="An isolated decoy session was established.",
            environment="decoy",
            session_id=session_id,
            source=client_ip,
        )

    return {
        "access_token": token,
        "token_type": "Bearer",
        "mode": "real" if token_type == "genuine" else "decoy",
        "session_id": session_id,
        "expires_in_seconds": 900,
    }


@router.post("/auth/logout")
def logout(authorization: Optional[str] = Header(default=None)):
    """Clear session and record logout event."""
    if authorization:
        try:
            token = get_bearer_token(authorization)
            # Try decoding as decoy first
            try:
                claims = verify_token(token, "decoy")
                sid = claims.get("session_id") or claims.get("jti")
                if sid:
                    unregister_decoy_session(sid)
                record_event(
                    event_type="logout",
                    severity="low",
                    message="Decoy user logged out; session terminated.",
                    environment="decoy",
                    session_id=sid,
                )
                return {"message": "Logged out successfully", "mode": "decoy"}
            except HTTPException:
                pass

            # Try decoding as genuine
            claims = verify_token(token, "genuine")
            record_event(
                event_type="logout",
                severity="low",
                message="Genuine administrator logged out.",
                environment="genuine",
                session_id=claims.get("jti"),
            )
            return {"message": "Logged out successfully", "mode": "genuine"}
        except HTTPException:
            pass

    return {"message": "Session cleared"}


@router.post("/demo/token/{token_type}")
def create_demo_token(token_type: str):
    # Demo-token issuance must never be enabled outside development
    if settings.environment.lower() != "development":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found",
        )

    if token_type not in {"genuine", "decoy"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token type must be genuine or decoy",
        )

    session_id = secrets.token_hex(12)
    token = issue_token(
        subject=(
            "demo-admin"
            if token_type == "genuine"
            else "demo-visitor"
        ),
        token_type=token_type,
        extra_claims={"session_id": session_id},
    )

    record_event(
        event_type="demo_token_issued",
        severity="low",
        message=f"A {token_type} demonstration token was issued.",
        environment=token_type,
        session_id=session_id,
    )

    if token_type == "decoy":
        register_decoy_session(session_id)

    return {
        "token_type": token_type,
        "access_token": token,
        "token_type_header": "Bearer",
        "session_id": session_id,
        "expires_in_seconds": 900,
        "warning": "Development only; never use this issuer in production.",
    }


@router.get("/admin/overview")
def admin_overview(
    claims: dict[str, Any] = Depends(genuine_claims),
):
    """Retrieve protected administrative overview data.
    
    Safe genuine workspace data; never exposes sensitive real records.
    """
    return {
        "access": "genuine",
        "message": "Genuine administrative access verified.",
        "subject": claims["sub"],
        "data": {
            "environment": "genuine",
            "system_status": "operational",
            "soc_cluster": "cluster-node-01.tokentrap.internal",
            "active_monitors": 8,
            "threat_detection_engine": "active",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "note": "Protected administrative overview data. No real personal records exposed.",
        },
    }


@router.get("/decoy/documents")
def decoy_documents(
    claims: dict[str, Any] = Depends(decoy_claims),
):
    """Retrieve synthetic decoy resources.
    
    Access to this endpoint is recorded as a decoy_document_access security event.
    """
    sid = claims.get("session_id") or claims.get("jti")
    record_event(
        event_type="decoy_document_access",
        severity="high",
        message="A decoy document catalog was accessed.",
        environment="decoy",
        session_id=sid,
    )

    return {
        "access": "decoy",
        "message": "Decoy simulated environment accessed.",
        "subject": claims["sub"],
        "documents": list(VALID_DECOY_RESOURCES.values()),
    }


@router.post("/decoy/resources/{resource_id}/activate")
def activate_decoy_resource(
    resource_id: str,
    claims: dict[str, Any] = Depends(decoy_claims),
):
    """Record a designated decoy interaction.
    
    Validates resource_id against explicit set of synthetic resources.
    Unknown IDs are rejected (404).
    """
    resource = VALID_DECOY_RESOURCES.get(resource_id)
    sid = claims.get("session_id") or claims.get("jti")

    if not resource:
        record_event(
            event_type="blocked_api_request",
            severity="medium",
            message=f"Unknown decoy resource activation attempt: {resource_id}",
            environment="decoy",
            session_id=sid,
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Decoy resource '{resource_id}' not found in registry.",
        )

    record_event(
        event_type="decoy_token_activation",
        severity="critical",
        message=f"Honey token interaction detected: '{resource['name']}' ({resource_id}) was activated.",
        environment="decoy",
        session_id=sid,
    )

    return {
        "status": "activated",
        "resource_id": resource_id,
        "name": resource["name"],
        "classification": resource["classification"],
        "preview": resource["preview"],
        "interaction_logged": True,
        "message": "Interaction with simulated resource logged by TokenTrap Deception Engine.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
