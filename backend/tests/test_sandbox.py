import pytest
from fastapi.testclient import TestClient

from app.auth.tokens import issue_token
from app.deception.sandbox import (
    SANDBOX_TABLES,
    detect_sql_injection,
    execute_simulated_query,
    generate_table_export,
)
from app.main import app

client = TestClient(app)


@pytest.fixture
def decoy_token():
    return issue_token(
        subject="visitor@gmail.com",
        token_type="decoy",
        extra_claims={"session_id": "TEST-SESS-VISITOR-01"},
    )


@pytest.fixture
def genuine_token():
    return issue_token(
        subject="admin@gmail.com",
        token_type="genuine",
        extra_claims={"session_id": "TEST-SESS-ADMIN-01"},
    )


def test_sql_injection_detector():
    is_sqli, token = detect_sql_injection("SELECT * FROM users WHERE id = 1 UNION SELECT null, username, password FROM admin")
    assert is_sqli is True
    assert "UNION" in token.upper()

    is_sqli, token = detect_sql_injection("SELECT * FROM records WHERE 1=1 OR '1'='1'")
    assert is_sqli is True

    is_sqli, token = detect_sql_injection("SELECT * FROM honey_financial_ledgers; DROP TABLE users;")
    assert is_sqli is True

    is_safe, _ = detect_sql_injection("SELECT transfer_id, amount_usd FROM honey_financial_ledgers WHERE amount_usd > 1000000")
    assert is_safe is False


def test_execute_simulated_query_basic():
    res = execute_simulated_query("SELECT * FROM honey_financial_ledgers")
    assert res["status"] == "success"
    assert res["target_table"] == "honey_financial_ledgers"
    assert res["canary_token"] == "CANARY_SQL_WIRE_SWIFT_009"
    assert res["row_count"] == 4
    assert res["is_sql_injection"] is False


def test_execute_simulated_query_with_filter():
    res = execute_simulated_query("SELECT transfer_id, amount_usd FROM honey_financial_ledgers WHERE amount_usd > 2000000")
    assert res["status"] == "success"
    # Amounts: 1.25M, 4.85M, 720k, 18.9M -> 2 records > 2M
    assert res["row_count"] == 2
    for r in res["rows"]:
        assert r["amount_usd"] > 2000000


def test_table_export_contains_canary():
    dump = generate_table_export("honey_financial_ledgers", "sql")
    assert "CANARY_SQL_WIRE_SWIFT_009" in dump
    assert "INSERT INTO public.honey_financial_ledgers" in dump

    csv_dump = generate_table_export("honey_user_credentials", "csv")
    assert "CANARY_SQL_ADMIN_HASH_77" in csv_dump
    assert "sysadmin_root" in csv_dump


def test_sandbox_overview_decoy_access(decoy_token):
    resp = client.get("/api/sandbox/overview", headers={"Authorization": f"Bearer {decoy_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["database_engine"].startswith("PostgreSQL 16")
    assert "honey_financial_ledgers" in data["available_tables"]


def test_sandbox_tables_listing(decoy_token):
    resp = client.get("/api/sandbox/tables", headers={"Authorization": f"Bearer {decoy_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 4
    table_names = [t["table_name"] for t in data["tables"]]
    assert "honey_financial_ledgers" in table_names
    assert "honey_user_credentials" in table_names


def test_sandbox_table_records_and_canary_tripwire(decoy_token):
    resp = client.get(
        "/api/sandbox/tables/honey_financial_ledgers/records",
        headers={"Authorization": f"Bearer {decoy_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["table_name"] == "honey_financial_ledgers"
    assert data["canary_tripped"] is True
    assert len(data["rows"]) == 4


def test_sandbox_query_endpoint(decoy_token):
    payload = {"query": "SELECT * FROM honey_customer_pii LIMIT 2"}
    resp = client.post(
        "/api/sandbox/query",
        json=payload,
        headers={"Authorization": f"Bearer {decoy_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["target_table"] == "honey_customer_pii"
    assert data["canary_token"] == "CANARY_SQL_PII_SSN_551"
    assert data["row_count"] == 2


def test_sandbox_sql_injection_alert(decoy_token):
    payload = {"query": "SELECT * FROM honey_user_credentials WHERE username = 'admin' OR '1'='1'"}
    resp = client.post(
        "/api/sandbox/query",
        json=payload,
        headers={"Authorization": f"Bearer {decoy_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_sql_injection"] is True


def test_sandbox_export_triggers_exfiltration_alert(decoy_token):
    payload = {"table_name": "honey_financial_ledgers", "format": "sql"}
    resp = client.post(
        "/api/sandbox/export",
        json=payload,
        headers={"Authorization": f"Bearer {decoy_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "exported"
    assert data["canary_token"] == "CANARY_SQL_WIRE_SWIFT_009"
    assert "INSERT INTO public.honey_financial_ledgers" in data["content"]


def test_sandbox_audit_admin_access(genuine_token, decoy_token):
    # Decoy cannot access audit
    rej = client.get("/api/sandbox/audit", headers={"Authorization": f"Bearer {decoy_token}"})
    assert rej.status_code == 401

    # Genuine admin can access audit
    resp = client.get("/api/sandbox/audit", headers={"Authorization": f"Bearer {genuine_token}"})
    assert resp.status_code == 200
    assert "audit_logs" in resp.json()
