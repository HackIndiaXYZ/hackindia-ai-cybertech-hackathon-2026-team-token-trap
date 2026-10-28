from typing import Literal, Optional

from argon2 import PasswordHasher
from argon2.exceptions import VerificationError
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.auth.tokens import issue_token, verify_token
from app.config import settings
from app.monitoring.events import record_event


router = APIRouter(prefix="/api", tags=["Security"])

password_hasher = PasswordHasher()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=1024)
    mode: Literal["real", "decoy"]


def get_bearer_token(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(
            status_code=401,
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
            status_code=401,
            detail="Invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token.strip()


def genuine_claims(
    authorization: Optional[str] = Header(default=None),
) -> dict:
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
) -> dict:
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
def login(request: LoginRequest):
    email = str(request.email).strip().lower()

    if request.mode == "real":
        configured_email = settings.admin_email
        password_hash = settings.admin_password_hash
        token_type = "genuine"
    else:
        configured_email = settings.decoy_email
        password_hash = settings.decoy_password_hash
        token_type = "decoy"

    # Fail safely if the selected account has not been configured.
    if not configured_email or not password_hash:
        raise HTTPException(
            status_code=503,
            detail="Login is not configured for this account mode.",
        )

    # Email and password must both match the selected account.
    email_matches = email == configured_email.strip().lower()

    try:
        password_matches = password_hasher.verify(
            password_hash,
            request.password,
        )
    except VerificationError:
        password_matches = False

    if not email_matches or not password_matches:
        record_event(
            event_type="login_failed",
            severity="medium",
            message="A login attempt failed credential verification.",
            environment=token_type,
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password for the selected account mode.",
        )

    token = issue_token(
        subject=email,
        token_type=token_type,
        extra_claims={
            "email": email,
            "role": "admin" if token_type == "genuine" else "decoy",
        },
    )

    record_event(
        event_type="login_succeeded",
        severity="low",
        message=f"A {token_type} account authenticated successfully.",
        environment=token_type,
    )

    return {
        "access_token": token,
        "token_type": "Bearer",
        "mode": request.mode,
        "expires_in_seconds": 900,
    }


@router.post("/demo/token/{token_type}")
def create_demo_token(token_type: str):
    # Demo-token issuance must never be enabled in production.
    if settings.environment.lower() != "development":
        raise HTTPException(status_code=404, detail="Not found")

    if token_type not in {"genuine", "decoy"}:
        raise HTTPException(
            status_code=400,
            detail="Token type must be genuine or decoy",
        )

    token = issue_token(
        subject=(
            "demo-admin"
            if token_type == "genuine"
            else "demo-visitor"
        ),
        token_type=token_type,
    )

    record_event(
        event_type="demo_token_issued",
        severity="low",
        message=f"A {token_type} demonstration token was issued.",
        environment=token_type,
    )

    return {
        "token_type": token_type,
        "access_token": token,
        "token_type_header": "Bearer",
        "expires_in_seconds": 900,
        "warning": "Development only; never use this issuer in production.",
    }


@router.get("/admin/overview")
def admin_overview(
    claims: dict = Depends(genuine_claims),
):
    return {
        "access": "genuine",
        "message": "Genuine administrative access verified.",
        "subject": claims["sub"],
        "data": {
            "environment": "genuine",
            "note": "Placeholder data; no real records exposed.",
        },
    }


@router.get("/decoy/documents")
def decoy_documents(
    claims: dict = Depends(decoy_claims),
):
    record_event(
        event_type="decoy_document_access",
        severity="high",
        message="A decoy document endpoint was accessed.",
        environment="decoy",
    )

    return {
        "access": "decoy",
        "message": "Decoy environment accessed.",
        "subject": claims["sub"],
        "documents": [
            {
                "id": "DECOY-001",
                "name": "Confidential_Strategy_DRAFT.pdf",
                "classification": "SIMULATED DECOY DATA",
            },
            {
                "id": "DECOY-002",
                "name": "Internal_Credentials_Archive.txt",
                "classification": "SIMULATED DECOY DATA",
            },
        ],
    }
