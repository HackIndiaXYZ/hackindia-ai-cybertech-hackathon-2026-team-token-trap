from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.auth.routes import decoy_claims, genuine_claims
from app.database.connection import SessionLocal
from app.database.repository import (
    list_sandbox_audit_logs,
    log_sandbox_action,
    record_canary_activation,
)
from app.deception.sandbox import (
    SANDBOX_TABLES,
    execute_simulated_query,
    generate_table_export,
)
from app.monitoring.events import record_event

router = APIRouter(prefix="/sandbox", tags=["deception-sandbox"])


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000, description="SQL query to execute against sandbox database")


class ExportRequest(BaseModel):
    table_name: str = Field(..., description="Target sandbox table to export")
    format: str = Field("sql", description="Export format: 'sql' or 'csv'")


@router.get("/overview")
def get_sandbox_overview(claims: dict[str, Any] = Depends(decoy_claims)):
    """Return status and configuration of the PostgreSQL deception sandbox."""
    return {
        "status": "online",
        "database_engine": "PostgreSQL 16.2 (Debian CIS Hardened)",
        "cluster_name": "tokentrap-deception-sandbox-01.internal",
        "environment": "decoy_sandbox",
        "tables_count": len(SANDBOX_TABLES),
        "available_tables": list(SANDBOX_TABLES.keys()),
        "security_policy": "ISOLATED_SANDBOX_STRICT",
        "visitor_session": claims.get("session_id") or claims.get("jti"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/tables")
def list_sandbox_tables(claims: dict[str, Any] = Depends(decoy_claims)):
    """List available decoy database tables and schemas."""
    tables_summary = []
    for name, meta in SANDBOX_TABLES.items():
        tables_summary.append({
            "table_name": name,
            "resource_id": meta["resource_id"],
            "description": meta["description"],
            "classification": meta["classification"],
            "columns_count": len(meta["columns"]),
            "columns": meta["columns"],
            "approximate_rows": len(meta["records"]),
        })
    return {
        "tables": tables_summary,
        "count": len(tables_summary),
    }


@router.get("/tables/{table_name}/records")
def get_table_records(
    table_name: str,
    raw_req: Request,
    claims: dict[str, Any] = Depends(decoy_claims),
):
    """Retrieve rows from a sandbox table and trigger honey-token tripwire."""
    table = SANDBOX_TABLES.get(table_name)
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table '{table_name}' does not exist in the sandbox database schema.",
        )

    sid = claims.get("session_id") or claims.get("jti") or "anonymous_decoy"
    sub = claims.get("sub", "visitor@gmail.com")
    client_ip = raw_req.client.host if raw_req.client else "127.0.0.1"
    user_agent = raw_req.headers.get("user-agent", "Unknown")

    canary_token = table["canary_token"]
    resource_id = table["resource_id"]

    # 1. Trigger SOC Security Monitoring Event
    record_event(
        event_type="sandbox_database_accessed",
        severity="high",
        message=f"Visitor accessed decoy table '{table_name}' ({resource_id}). Honey-token tripwire activated.",
        environment="decoy",
        session_id=sid,
        source=client_ip,
    )

    record_event(
        event_type="honey_canary_token_tripped",
        severity="critical",
        message=f"Honey token '{canary_token}' tripped on table '{table_name}'.",
        environment="decoy",
        session_id=sid,
        source=client_ip,
    )

    # 2. Persist to database audit log and increment canary activation counter
    try:
        with SessionLocal() as db:
            log_sandbox_action(
                db=db,
                session_id=sid,
                visitor_email=sub,
                action_type="table_scan",
                target_table=table_name,
                query_text=f"SELECT * FROM {table_name}",
                canary_token_tripped=canary_token,
                client_ip=client_ip,
                user_agent=user_agent,
                rows_returned=len(table["records"]),
                severity="high",
            )
            record_canary_activation(db, resource_id=resource_id)
    except Exception:
        pass

    return {
        "table_name": table_name,
        "classification": table["classification"],
        "columns": [c["name"] for c in table["columns"]],
        "rows": table["records"],
        "row_count": len(table["records"]),
        "canary_tripped": True,
        "message": f"Retrieved {len(table['records'])} records from {table_name}.",
    }


@router.post("/query")
def run_sandbox_query(
    req: QueryRequest,
    raw_req: Request,
    claims: dict[str, Any] = Depends(decoy_claims),
):
    """Execute an interactive SQL query in the sandbox database and track visitor intent."""
    query_str = req.query.strip()
    sid = claims.get("session_id") or claims.get("jti") or "anonymous_decoy"
    sub = claims.get("sub", "visitor@gmail.com")
    client_ip = raw_req.client.host if raw_req.client else "127.0.0.1"
    user_agent = raw_req.headers.get("user-agent", "Unknown")

    # Run query against simulated sandbox
    result = execute_simulated_query(query_str)
    target_table = result["target_table"]
    canary_token = result["canary_token"]
    is_sqli = result["is_sql_injection"]
    sqli_token = result["sqli_pattern_detected"]

    # 1. Trigger SOC Security Monitoring Event
    if is_sqli:
        record_event(
            event_type="sandbox_sql_injection_detected",
            severity="critical",
            message=f"SQL injection attempt detected from visitor: '{sqli_token}' in query: {query_str[:80]}",
            environment="decoy",
            session_id=sid,
            source=client_ip,
        )
    else:
        record_event(
            event_type="sandbox_sql_query_executed",
            severity="high",
            message=f"Visitor executed SQL query on table '{target_table}': {query_str[:80]}",
            environment="decoy",
            session_id=sid,
            source=client_ip,
        )

    # Every executed query trips the canary token of the targeted decoy table
    record_event(
        event_type="honey_canary_token_tripped",
        severity="critical",
        message=f"Honey token '{canary_token}' activated via SQL query on '{target_table}'.",
        environment="decoy",
        session_id=sid,
        source=client_ip,
    )

    # 2. Persist audit log
    action_type = "sql_injection" if is_sqli else "sql_query"
    severity_level = "critical" if is_sqli else "high"
    try:
        with SessionLocal() as db:
            log_sandbox_action(
                db=db,
                session_id=sid,
                visitor_email=sub,
                action_type=action_type,
                target_table=target_table,
                query_text=query_str,
                canary_token_tripped=canary_token,
                client_ip=client_ip,
                user_agent=user_agent,
                rows_returned=result["row_count"],
                severity=severity_level,
            )
            # Find matching resource_id
            tbl_meta = SANDBOX_TABLES.get(target_table)
            if tbl_meta:
                record_canary_activation(db, resource_id=tbl_meta["resource_id"])
    except Exception:
        pass

    return result


@router.post("/export")
def export_sandbox_table(
    req: ExportRequest,
    raw_req: Request,
    claims: dict[str, Any] = Depends(decoy_claims),
):
    """Simulate data dump export and trigger data exfiltration honey-token alert."""
    table_name = req.table_name.strip()
    export_fmt = req.format.strip().lower()

    if table_name not in SANDBOX_TABLES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table '{table_name}' not found for export.",
        )

    sid = claims.get("session_id") or claims.get("jti") or "anonymous_decoy"
    sub = claims.get("sub", "visitor@gmail.com")
    client_ip = raw_req.client.host if raw_req.client else "127.0.0.1"
    user_agent = raw_req.headers.get("user-agent", "Unknown")

    tbl_meta = SANDBOX_TABLES[table_name]
    canary_token = tbl_meta["canary_token"]
    payload = generate_table_export(table_name, export_fmt)

    # Trigger Critical Exfiltration Alert
    record_event(
        event_type="sandbox_data_exfiltration_attempt",
        severity="critical",
        message=f"DATA EXFILTRATION DETECTED: Visitor attempted to export {table_name} as {export_fmt.upper()}.",
        environment="decoy",
        session_id=sid,
        source=client_ip,
    )

    record_event(
        event_type="honey_canary_token_tripped",
        severity="critical",
        message=f"Honey token '{canary_token}' extracted in data exfiltration dump.",
        environment="decoy",
        session_id=sid,
        source=client_ip,
    )

    # Persist audit
    try:
        with SessionLocal() as db:
            log_sandbox_action(
                db=db,
                session_id=sid,
                visitor_email=sub,
                action_type="data_export",
                target_table=table_name,
                query_text=f"EXPORT TABLE {table_name} FORMAT {export_fmt}",
                canary_token_tripped=canary_token,
                client_ip=client_ip,
                user_agent=user_agent,
                rows_returned=len(tbl_meta["records"]),
                severity="critical",
            )
            record_canary_activation(db, resource_id=tbl_meta["resource_id"])
    except Exception:
        pass

    return {
        "status": "exported",
        "table_name": table_name,
        "format": export_fmt,
        "filename": f"{table_name}_dump.{export_fmt}",
        "content": payload,
        "canary_token": canary_token,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/audit")
def get_sandbox_audit_logs(
    limit: int = 50,
    claims: dict[str, Any] = Depends(genuine_claims),
):
    """Admin-only audit endpoint to inspect visitor queries and canary tripwires."""
    with SessionLocal() as db:
        logs = list_sandbox_audit_logs(db=db, limit=limit)
    return {
        "audit_logs": logs,
        "count": len(logs),
        "queried_by": claims.get("sub"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
