from __future__ import annotations

import re
import time
from typing import Any, Optional


# ============================================================================
# Synthetic Sandbox Tables & Honey-Token Canary Metadata
# ============================================================================

SANDBOX_TABLES: dict[str, dict[str, Any]] = {
    "honey_financial_ledgers": {
        "table_name": "honey_financial_ledgers",
        "resource_id": "HONEY-DB-FIN-01",
        "description": "Internal Wire Transfers & Offshore Escrow Ledgers",
        "classification": "Top Secret Financial",
        "canary_token": "CANARY_SQL_WIRE_SWIFT_009",
        "columns": [
            {"name": "transfer_id", "type": "VARCHAR(32)", "primary_key": True},
            {"name": "source_account", "type": "VARCHAR(64)", "primary_key": False},
            {"name": "destination_account", "type": "VARCHAR(64)", "primary_key": False},
            {"name": "amount_usd", "type": "NUMERIC(14,2)", "primary_key": False},
            {"name": "swift_bic", "type": "VARCHAR(16)", "primary_key": False},
            {"name": "authorized_by", "type": "VARCHAR(100)", "primary_key": False},
            {"name": "status", "type": "VARCHAR(24)", "primary_key": False},
            {"name": "routing_code", "type": "VARCHAR(32)", "primary_key": False},
        ],
        "records": [
            {
                "transfer_id": "TX-99482-CH",
                "source_account": "ACT-CORP-MAIN-8812",
                "destination_account": "ACT-OFFSHORE-PANAMA-7701",
                "amount_usd": 1250000.00,
                "swift_bic": "UBSWCHZH80A",
                "authorized_by": "CFO_EXECUTIVE_DESK",
                "status": "COMPLETED",
                "routing_code": "CANARY-SWIFT-TRIPWIRE-ALPHA-01",
            },
            {
                "transfer_id": "TX-99483-KY",
                "source_account": "ACT-RESERVE-FED-1049",
                "destination_account": "ACT-CAYMAN-SETTLE-4091",
                "amount_usd": 4850000.00,
                "swift_bic": "BARCKY22XXX",
                "authorized_by": "BOARD_RESOLVE_EXEC_AUTH",
                "status": "PENDING_SETTLEMENT",
                "routing_code": "CANARY-SWIFT-TRIPWIRE-BETA-02",
            },
            {
                "transfer_id": "TX-99484-SG",
                "source_account": "ACT-ASIA-PAC-0021",
                "destination_account": "ACT-SINGAPORE-ESCROW-884",
                "amount_usd": 720000.00,
                "swift_bic": "DBSSSGSGXXX",
                "authorized_by": "TREASURY_OPS_MGR",
                "status": "COMPLETED",
                "routing_code": "CANARY-SWIFT-TRIPWIRE-GAMMA-03",
            },
            {
                "transfer_id": "TX-99485-CH",
                "source_account": "ACT-MERGER-ESCROW-661",
                "destination_account": "ACT-ZURICH-CONFIDENTIAL-01",
                "amount_usd": 18900000.00,
                "swift_bic": "CRESCHZZXXX",
                "authorized_by": "CHAIRMAN_SPECIAL_DIR",
                "status": "CLEARING_AUDIT",
                "routing_code": "CANARY-SWIFT-TRIPWIRE-DELTA-04",
            },
        ],
    },
    "honey_user_credentials": {
        "table_name": "honey_user_credentials",
        "resource_id": "HONEY-DB-AUTH-02",
        "description": "Root Administrative Password Hashes & Production API Keys",
        "classification": "Root Security Vault",
        "canary_token": "CANARY_SQL_ADMIN_HASH_77",
        "columns": [
            {"name": "user_id", "type": "VARCHAR(32)", "primary_key": True},
            {"name": "username", "type": "VARCHAR(64)", "primary_key": False},
            {"name": "email", "type": "VARCHAR(128)", "primary_key": False},
            {"name": "role", "type": "VARCHAR(32)", "primary_key": False},
            {"name": "argon2_hash", "type": "TEXT", "primary_key": False},
            {"name": "api_token", "type": "VARCHAR(64)", "primary_key": False},
            {"name": "mfa_backup_code", "type": "VARCHAR(32)", "primary_key": False},
        ],
        "records": [
            {
                "user_id": "UID-ROOT-001",
                "username": "sysadmin_root",
                "email": "sysadmin@enterprise.internal",
                "role": "cluster_superadmin",
                "argon2_hash": "$argon2id$v=19$m=65536,t=3,p=4$CANARY_ROOT_HASH_01$9Zb12eK",
                "api_token": "tok_live_prod_CANARY_SYSADMIN_KEY_9921",
                "mfa_backup_code": "CANARY-MFA-001-992",
            },
            {
                "user_id": "UID-DEVOPS-002",
                "username": "devops_deployer",
                "email": "ci-deploy@enterprise.internal",
                "role": "pipeline_deployer",
                "argon2_hash": "$argon2id$v=19$m=65536,t=3,p=4$CANARY_DEVOPS_HASH_02$8Xx73kA",
                "api_token": "tok_live_prod_CANARY_PIPELINE_KEY_4410",
                "mfa_backup_code": "CANARY-MFA-002-331",
            },
            {
                "user_id": "UID-DBA-003",
                "username": "db_master_admin",
                "email": "dba@enterprise.internal",
                "role": "database_admin",
                "argon2_hash": "$argon2id$v=19$m=65536,t=3,p=4$CANARY_DBA_HASH_03$3Mm99zP",
                "api_token": "tok_live_prod_CANARY_PG_SUPER_KEY_7720",
                "mfa_backup_code": "CANARY-MFA-003-774",
            },
            {
                "user_id": "UID-SECURITY-004",
                "username": "soc_incident_lead",
                "email": "soc-lead@enterprise.internal",
                "role": "security_officer",
                "argon2_hash": "$argon2id$v=19$m=65536,t=3,p=4$CANARY_SOC_HASH_04$5Kk11qL",
                "api_token": "tok_live_prod_CANARY_SOC_FIREWALL_KEY_1109",
                "mfa_backup_code": "CANARY-MFA-004-552",
            },
        ],
    },
    "honey_customer_pii": {
        "table_name": "honey_customer_pii",
        "resource_id": "HONEY-DB-PII-03",
        "description": "High Net-Worth VIP Customer Profiles, SSNs & Encrypted Cards",
        "classification": "Restricted Customer PII",
        "canary_token": "CANARY_SQL_PII_SSN_551",
        "columns": [
            {"name": "customer_id", "type": "VARCHAR(32)", "primary_key": True},
            {"name": "full_name", "type": "VARCHAR(128)", "primary_key": False},
            {"name": "ssn_canary", "type": "VARCHAR(16)", "primary_key": False},
            {"name": "credit_card_masked", "type": "VARCHAR(24)", "primary_key": False},
            {"name": "billing_address", "type": "VARCHAR(255)", "primary_key": False},
            {"name": "annual_net_worth", "type": "VARCHAR(32)", "primary_key": False},
            {"name": "vip_tier", "type": "VARCHAR(24)", "primary_key": False},
        ],
        "records": [
            {
                "customer_id": "CUST-VIP-101",
                "full_name": "Harrison K. Vance",
                "ssn_canary": "000-12-CANARY-99",
                "credit_card_masked": "4111-XXXX-XXXX-9821",
                "billing_address": "742 Evergreen Terrace, Zurich CH",
                "annual_net_worth": "$14,500,000",
                "vip_tier": "DIAMOND_PRIVATE",
            },
            {
                "customer_id": "CUST-VIP-102",
                "full_name": "Lady Eleanor Sterling",
                "ssn_canary": "000-34-CANARY-88",
                "credit_card_masked": "3782-XXXX-XXXX-0012",
                "billing_address": "10 Kensington Palace Gardens, London UK",
                "annual_net_worth": "$28,000,000",
                "vip_tier": "SOVEREIGN_ROYAL",
            },
            {
                "customer_id": "CUST-VIP-103",
                "full_name": "Arthur Pendelton Jr.",
                "ssn_canary": "000-56-CANARY-77",
                "credit_card_masked": "5500-XXXX-XXXX-3341",
                "billing_address": "55 Wall Street, Penthouse B, NY USA",
                "annual_net_worth": "$42,000,000",
                "vip_tier": "FOUNDER_CHAIRMAN",
            },
            {
                "customer_id": "CUST-VIP-104",
                "full_name": "Dr. Aris Thorne",
                "ssn_canary": "000-78-CANARY-66",
                "credit_card_masked": "4024-XXXX-XXXX-5519",
                "billing_address": "8 Marina Boulevard, Singapore SG",
                "annual_net_worth": "$19,200,000",
                "vip_tier": "TECH_INVESTOR",
            },
        ],
    },
    "honey_infrastructure_nodes": {
        "table_name": "honey_infrastructure_nodes",
        "resource_id": "HONEY-DB-INFRA-04",
        "description": "Kubernetes Cluster Nodes, Secrets & Production Bastion SSH Keys",
        "classification": "Critical Infrastructure",
        "canary_token": "CANARY_SQL_K8S_ROOT_334",
        "columns": [
            {"name": "node_id", "type": "VARCHAR(32)", "primary_key": True},
            {"name": "hostname", "type": "VARCHAR(128)", "primary_key": False},
            {"name": "ip_address", "type": "VARCHAR(45)", "primary_key": False},
            {"name": "os_distro", "type": "VARCHAR(64)", "primary_key": False},
            {"name": "k8s_secret_token", "type": "TEXT", "primary_key": False},
            {"name": "bastion_ssh_key", "type": "TEXT", "primary_key": False},
            {"name": "environment", "type": "VARCHAR(32)", "primary_key": False},
        ],
        "records": [
            {
                "node_id": "NODE-K8S-M01",
                "hostname": "k8s-master-01.prod.tokentrap.internal",
                "ip_address": "10.240.0.10",
                "os_distro": "Ubuntu 24.04 LTS Hardened",
                "k8s_secret_token": "k8s_jwt_CANARY_ROOT_TOKEN_SEC_99182371",
                "bastion_ssh_key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI-CANARY-BASTION-ROOT-KEY",
                "environment": "production-eu-central-1",
            },
            {
                "node_id": "NODE-DB-PG01",
                "hostname": "pg-primary-01.db.tokentrap.internal",
                "ip_address": "10.240.1.50",
                "os_distro": "Debian 12 Bookworm CIS Benchmark",
                "k8s_secret_token": "pg_cluster_secret_CANARY_REPL_AUTH_29103",
                "bastion_ssh_key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI-CANARY-DBA-ROOT-KEY",
                "environment": "production-eu-central-1",
            },
            {
                "node_id": "NODE-VAULT-01",
                "hostname": "hashicorp-vault-01.sec.tokentrap.internal",
                "ip_address": "10.240.2.100",
                "os_distro": "Alpine Linux 3.20 Secure",
                "k8s_secret_token": "s.hvmCANARY_ROOT_UNSEAL_TOKEN_998822",
                "bastion_ssh_key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI-CANARY-VAULT-ROOT-KEY",
                "environment": "production-vault-cluster",
            },
            {
                "node_id": "NODE-EDGE-GW01",
                "hostname": "edge-gateway-01.net.tokentrap.internal",
                "ip_address": "10.240.3.5",
                "os_distro": "Alpine Linux 3.20 Firewall",
                "k8s_secret_token": "envoy_mTLS_CANARY_CERT_KEY_PAIR_8819",
                "bastion_ssh_key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI-CANARY-NETOPS-ROOT-KEY",
                "environment": "edge-dmz-zone",
            },
        ],
    },
}


# ============================================================================
# SQL Injection Detection Pattern
# ============================================================================

SQLI_PATTERNS = [
    re.compile(r"(\bUNION\b.*\bSELECT\b)", re.IGNORECASE),
    re.compile(r"(\bOR\b|\bAND\b)\s+('|\")?\d+('|\")?\s*=\s*('|\")?\d+", re.IGNORECASE),
    re.compile(r"(\bOR\b|\bAND\b)\s+('|\")?[a-zA-Z]+('|\")?\s*=\s*('|\")?[a-zA-Z]+", re.IGNORECASE),
    re.compile(r"('|\")\s*(OR|AND)\s*('|\")?\d+('|\")?\s*=\s*('|\")?\d+", re.IGNORECASE),
    re.compile(r"('|\")\s*(OR|AND)\s*('|\")?[a-zA-Z]+('|\")?\s*=\s*('|\")?[a-zA-Z]+", re.IGNORECASE),
    re.compile(r"\b1\s*=\s*1\b", re.IGNORECASE),
    re.compile(r"(;\s*DROP\s+TABLE\b)", re.IGNORECASE),
    re.compile(r"(;\s*DELETE\s+FROM\b)", re.IGNORECASE),
    re.compile(r"(\bSLEEP\s*\(|\bBENCHMARK\s*\()", re.IGNORECASE),
    re.compile(r"(INFORMATION_SCHEMA|PG_CATALOG|PG_USER|PG_SHADOW)", re.IGNORECASE),
    re.compile(r"(--|\/\*|\*\/)", re.IGNORECASE),
]


def detect_sql_injection(query: str) -> tuple[bool, Optional[str]]:
    """Inspect query string for known SQL injection heuristics."""
    q = query.strip()
    for pattern in SQLI_PATTERNS:
        match = pattern.search(q)
        if match:
            return True, match.group(0)
    return False, None


def execute_simulated_query(query: str) -> dict[str, Any]:
    """Execute SQL query against the synthetic sandbox database."""
    start_time = time.perf_counter()
    clean_query = query.strip()

    is_sqli, sqli_token = detect_sql_injection(clean_query)

    # Determine targeted table
    target_table = None
    for tbl_name in SANDBOX_TABLES.keys():
        if re.search(r"\b" + re.escape(tbl_name) + r"\b", clean_query, re.IGNORECASE):
            target_table = tbl_name
            break

    # If no recognized table in query, fallback to the first table
    if not target_table:
        target_table = "honey_financial_ledgers"

    tbl_meta = SANDBOX_TABLES[target_table]
    all_records = tbl_meta["records"]
    canary_token = tbl_meta["canary_token"]

    matched_records = all_records

    # Simple column projection parsing
    # e.g., SELECT transfer_id, amount_usd FROM ...
    col_match = re.search(r"SELECT\s+(.*?)\s+FROM", clean_query, re.IGNORECASE)
    if col_match:
        requested_cols = [c.strip().lower() for c in col_match.group(1).split(",")]
        if requested_cols != ["*"]:
            filtered_rows = []
            for r in matched_records:
                filtered_row = {k: v for k, v in r.items() if k.lower() in requested_cols}
                if filtered_row:
                    filtered_rows.append(filtered_row)
            matched_records = filtered_rows or matched_records

    # Simple WHERE clause numerical filter simulation
    # e.g. amount_usd > 1000000
    gt_match = re.search(r"WHERE\s+amount_usd\s*>\s*(\d+)", clean_query, re.IGNORECASE)
    if gt_match and target_table == "honey_financial_ledgers":
        min_val = float(gt_match.group(1))
        matched_records = [r for r in matched_records if r.get("amount_usd", 0) > min_val]

    # Simple LIMIT simulation
    limit_match = re.search(r"LIMIT\s+(\d+)", clean_query, re.IGNORECASE)
    if limit_match:
        limit_val = int(limit_match.group(1))
        matched_records = matched_records[:limit_val]

    elapsed_ms = round((time.perf_counter() - start_time) * 1000 + 4.2, 2)

    return {
        "status": "success",
        "target_table": target_table,
        "is_sql_injection": is_sqli,
        "sqli_pattern_detected": sqli_token,
        "canary_token": canary_token,
        "columns": [c["name"] for c in tbl_meta["columns"]],
        "rows": matched_records,
        "row_count": len(matched_records),
        "execution_time_ms": elapsed_ms,
        "database_node": "PostgreSQL 16.2 (Debian) on x86_64 — Deception Sandbox Cluster",
    }


def generate_table_export(table_name: str, export_format: str = "sql") -> str:
    """Generate simulated SQL dump or CSV export payload containing honey tokens."""
    tbl = SANDBOX_TABLES.get(table_name)
    if not tbl:
        tbl = SANDBOX_TABLES["honey_financial_ledgers"]

    records = tbl["records"]
    canary = tbl["canary_token"]

    if export_format.lower() == "csv":
        if not records:
            return ""
        headers = list(records[0].keys())
        lines = [",".join(headers)]
        for r in records:
            lines.append(",".join(str(r.get(h, "")) for h in headers))
        return f"# TRAP_CANARY_MARKER: {canary}\n" + "\n".join(lines)

    # Default to SQL dump
    cols = ", ".join(f'"{c["name"]}"' for c in tbl["columns"])
    dump_lines = [
        f"-- ==================================================================",
        f"-- PostgreSQL Database Dump (Simulated Deception Archive)",
        f"-- Source: tokentrap_sandbox.public.{table_name}",
        f"-- Canary Token Signature: {canary}",
        f"-- Generated at UTC timestamp",
        f"-- ==================================================================",
        f"",
        f"SET statement_timeout = 0;",
        f"SET client_encoding = 'UTF8';",
        f"",
    ]

    for r in records:
        vals = []
        for c in tbl["columns"]:
            v = r.get(c["name"])
            if v is None:
                vals.append("NULL")
            elif isinstance(v, (int, float)):
                vals.append(str(v))
            else:
                vals.append(f"'{str(v)}'")
        dump_lines.append(f"INSERT INTO public.{table_name} ({cols}) VALUES ({', '.join(vals)});")

    return "\n".join(dump_lines)
