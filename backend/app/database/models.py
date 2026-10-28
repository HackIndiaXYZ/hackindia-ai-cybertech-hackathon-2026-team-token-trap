from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import JSON


class Base(DeclarativeBase):
    """Base model class for all TokenTrap database entities."""
    pass


# Use JSONB on PostgreSQL, standard JSON fallback on SQLite
JSON_TYPE = JSONB().with_variant(JSON(), "sqlite")


class User(Base):
    """System accounts for genuine administrators and honeypot decoy users."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="admin", nullable=False)
    account_mode: Mapped[str] = mapped_column(String(50), default="genuine", nullable=False)  # 'genuine' | 'decoy'
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "account_mode": self.account_mode,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SecurityEvent(Base):
    """Immutable audit trail for authentication, canary alerts, and access events."""
    __tablename__ = "security_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)  # e.g., EVT-A1B2C3D4
    event_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # critical, high, medium, low, info
    environment: Mapped[str] = mapped_column(String(50), default="security", index=True, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    session_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    source: Mapped[str] = mapped_column(String(100), default="127.0.0.1", nullable=False)
    details: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON_TYPE, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        index=True,
        nullable=False,
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "event_type": self.event_type,
            "severity": self.severity,
            "environment": self.environment,
            "message": self.message,
            "session_id": self.session_id,
            "source": self.source,
            "details": self.details or {},
        }


class DecoyResource(Base):
    """Synthetic honeypot canary tokens and bait resources."""
    __tablename__ = "decoy_resources"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)  # e.g., DECOY-001
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)  # document, credential, database_dump
    classification: Mapped[str] = mapped_column(String(100), default="Confidential", nullable=False)
    fake_path: Mapped[str] = mapped_column(String(255), nullable=False)
    canary_token: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    activation_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_activated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_json: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON_TYPE, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.resource_type,
            "classification": self.classification,
            "fake_path": self.fake_path,
            "canary_token": self.canary_token,
            "activation_count": self.activation_count,
            "last_activated_at": self.last_activated_at.isoformat() if self.last_activated_at else None,
            "metadata": self.metadata_json or {},
        }


class DecoySession(Base):
    """Intruder and canary session tracking registry."""
    __tablename__ = "decoy_sessions"

    session_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    subject: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    client_ip: Mapped[str] = mapped_column(String(100), default="127.0.0.1", nullable=False)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    environment: Mapped[str] = mapped_column(String(50), default="decoy_sandbox", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    def to_dict(self) -> dict[str, Any]:
        return {
            "session_id": self.session_id,
            "subject": self.subject,
            "client_ip": self.client_ip,
            "user_agent": self.user_agent,
            "environment": self.environment,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_seen_at": self.last_seen_at.isoformat() if self.last_seen_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }


class AiConversation(Base):
    """Persisted audit and feedback history for AI Security Copilot queries."""
    __tablename__ = "ai_conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_email: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    model: Mapped[str] = mapped_column(String(100), default="gemini-2.5-flash", nullable=False)
    source: Mapped[str] = mapped_column(String(50), default="gemini", nullable=False)  # 'gemini' | 'soc_intelligence'
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        index=True,
        nullable=False,
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "user_email": self.user_email,
            "prompt": self.prompt,
            "response": self.response,
            "model": self.model,
            "source": self.source,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SandboxAuditLog(Base):
    """Detailed audit trail of intruder queries and honey-token interactions in the DB sandbox."""
    __tablename__ = "sandbox_audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    visitor_email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    action_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)  # 'table_scan', 'sql_query', 'canary_access', 'data_export', 'sql_injection'
    target_table: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    query_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    canary_token_tripped: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    client_ip: Mapped[str] = mapped_column(String(100), default="127.0.0.1", nullable=False)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rows_returned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="high", nullable=False)  # 'medium', 'high', 'critical'
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        index=True,
        nullable=False,
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "visitor_email": self.visitor_email,
            "action_type": self.action_type,
            "target_table": self.target_table,
            "query_text": self.query_text,
            "canary_token_tripped": self.canary_token_tripped,
            "client_ip": self.client_ip,
            "rows_returned": self.rows_returned,
            "severity": self.severity,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
