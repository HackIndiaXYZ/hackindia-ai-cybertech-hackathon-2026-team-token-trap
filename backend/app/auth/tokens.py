from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
import secrets

import jwt
from fastapi import HTTPException, status

from app.config import settings

ALGORITHM = "HS256"
TOKEN_LIFETIME_MINUTES = 15


def _token_config(token_type: str) -> tuple[str, str, str]:
    """Return signing key, issuer, and audience for one token class."""
    if token_type == "genuine":
        return (
            settings.genuine_jwt_secret,
            settings.genuine_jwt_issuer,
            settings.genuine_jwt_audience,
        )

    if token_type == "decoy":
        return (
            settings.decoy_jwt_secret,
            settings.decoy_jwt_issuer,
            settings.decoy_jwt_audience,
        )

    raise ValueError("Unsupported token type")


def issue_token(
    subject: str,
    token_type: str,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Issue a short-lived genuine or decoy token."""
    if not subject or len(subject) > 200:
        raise ValueError("Invalid token subject")

    key, issuer, audience = _token_config(token_type)
    now = datetime.now(timezone.utc)

    claims: dict[str, Any] = {
        "sub": subject,
        "iss": issuer,
        "aud": audience,
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=TOKEN_LIFETIME_MINUTES),
        "jti": secrets.token_urlsafe(24),
        "token_type": token_type,
    }

    # Callers must not override security-critical claims.
    forbidden = {
        "sub", "iss", "aud", "iat", "nbf",
        "exp", "jti", "token_type",
    }
    if extra_claims and forbidden.intersection(extra_claims):
        raise ValueError("Extra claims cannot override reserved claims")

    if extra_claims:
        claims.update(extra_claims)

    return jwt.encode(claims, key, algorithm=ALGORITHM)


def verify_token(token: str, expected_type: str) -> dict[str, Any]:
    """Verify signature and token context; reject the wrong token class."""
    key, issuer, audience = _token_config(expected_type)

    try:
        claims = jwt.decode(
            token,
            key,
            algorithms=[ALGORITHM],
            issuer=issuer,
            audience=audience,
            options={
                "require": [
                    "sub", "iss", "aud", "iat",
                    "nbf", "exp", "jti", "token_type",
                ]
            },
        )
    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    if claims.get("token_type") != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return claims