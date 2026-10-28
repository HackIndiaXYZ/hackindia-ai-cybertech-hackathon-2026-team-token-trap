from __future__ import annotations

import logging
import secrets
from datetime import datetime, timezone

from app.config import settings
from app.database.connection import SessionLocal, init_db
from app.database.models import User, DecoyResource, SecurityEvent
from app.database.repository import create_user, upsert_decoy_resource

logger = logging.getLogger("tokentrap.seed")


def seed_database() -> dict[str, int]:
    """Populate database with default genuine/decoy accounts and canary honeypots."""
    init_db()
    db = SessionLocal()
    counts = {"users": 0, "decoy_resources": 0, "events": 0}

    try:
        # 1. Genuine Administrator Account
        admin_email = settings.admin_email or "admin@gmail.com"
        admin_hash = settings.admin_password_hash or "$argon2id$v=19$m=65536,t=3,p=4$uEJKmdPx2eRKpsX0W/u9Bg$ZMgLXr+4iDGZqF4rvT7fPq3Dnzn2+cIuIrz6zDd5/rs"
        create_user(
            db=db,
            email=admin_email,
            password_hash=admin_hash,
            role="super_admin",
            account_mode="genuine",
        )
        counts["users"] += 1

        # 2. Decoy Honeypot Visitor Account
        decoy_email = settings.decoy_email or "visitor@gmail.com"
        decoy_hash = settings.decoy_password_hash or "$argon2id$v=19$m=65536,t=3,p=4$mmowQJvIKSIn0o/WRJINEA$RfzB59n2DbudqzpZLETHm6QMcLWB63mKFmeFFIAj3OM"
        create_user(
            db=db,
            email=decoy_email,
            password_hash=decoy_hash,
            role="decoy_guest",
            account_mode="decoy",
        )
        counts["users"] += 1

        # 3. Synthetic Decoy Resources (Canary Tokens)
        canaries = [
            {
                "resource_id": "DECOY-001",
                "name": "Confidential_Strategy_DRAFT.pdf",
                "resource_type": "document",
                "classification": "Top Secret",
                "fake_path": "/var/secure/docs/Confidential_Strategy_DRAFT.pdf",
                "canary_token": "CANARY_TOKEN_STRAT_2026_X9",
                "metadata_json": {
                    "file_size": "2.4 MB",
                    "synthetic_author": "Chief Strategy Officer",
                    "honey_marker": "TRAP-CANARY-ALPHA",
                },
            },
            {
                "resource_id": "DECOY-002",
                "name": "Internal_Credentials_Archive.txt",
                "resource_type": "credential",
                "classification": "Confidential",
                "fake_path": "/etc/vault/internal_credentials.txt",
                "canary_token": "CANARY_TOKEN_CRED_ARCHIVE_99",
                "metadata_json": {
                    "file_size": "48 KB",
                    "simulated_keys": 12,
                    "honey_marker": "TRAP-CANARY-BETA",
                },
            },
            {
                "resource_id": "DECOY-003",
                "name": "Synthetic_Database_Backup.sql",
                "resource_type": "database_dump",
                "classification": "Restricted",
                "fake_path": "/backups/db/production_dump_20260301.sql",
                "canary_token": "CANARY_TOKEN_DB_DUMP_SYNTH_01",
                "metadata_json": {
                    "file_size": "85.2 MB",
                    "simulated_tables": 34,
                    "honey_marker": "TRAP-CANARY-GAMMA",
                },
            },
            {
                "resource_id": "HONEY-CRED-01",
                "name": "AWS_Production_Keys_CANARY.json",
                "resource_type": "credential",
                "classification": "Critical Decoy",
                "fake_path": "/root/.aws/credentials.canary",
                "canary_token": "CANARY_TOKEN_AWS_ROOT_001",
                "metadata_json": {
                    "fake_access_key": "AKIA_FAKE_CANARY_ACCESS_KEY_01",
                    "fake_region": "us-east-1",
                    "honey_marker": "TRAP-CANARY-DELTA",
                },
            },
            {
                "resource_id": "HONEY-DB-FIN-01",
                "name": "honey_financial_ledgers",
                "resource_type": "database_table",
                "classification": "Top Secret Financial",
                "fake_path": "tokentrap_sandbox.public.honey_financial_ledgers",
                "canary_token": "CANARY_SQL_WIRE_SWIFT_009",
                "metadata_json": {
                    "simulated_records": 4,
                    "target": "SWIFT Wire Transfers",
                    "honey_marker": "TRAP-DB-FIN",
                },
            },
            {
                "resource_id": "HONEY-DB-AUTH-02",
                "name": "honey_user_credentials",
                "resource_type": "database_table",
                "classification": "Root Security Vault",
                "fake_path": "tokentrap_sandbox.public.honey_user_credentials",
                "canary_token": "CANARY_SQL_ADMIN_HASH_77",
                "metadata_json": {
                    "simulated_records": 4,
                    "target": "System Passwords & Tokens",
                    "honey_marker": "TRAP-DB-AUTH",
                },
            },
            {
                "resource_id": "HONEY-DB-PII-03",
                "name": "honey_customer_pii",
                "resource_type": "database_table",
                "classification": "Restricted Customer PII",
                "fake_path": "tokentrap_sandbox.public.honey_customer_pii",
                "canary_token": "CANARY_SQL_PII_SSN_551",
                "metadata_json": {
                    "simulated_records": 4,
                    "target": "Customer SSN & Cards",
                    "honey_marker": "TRAP-DB-PII",
                },
            },
            {
                "resource_id": "HONEY-DB-INFRA-04",
                "name": "honey_infrastructure_nodes",
                "resource_type": "database_table",
                "classification": "Critical Infrastructure",
                "fake_path": "tokentrap_sandbox.public.honey_infrastructure_nodes",
                "canary_token": "CANARY_SQL_K8S_ROOT_334",
                "metadata_json": {
                    "simulated_records": 4,
                    "target": "Kubernetes & SSH Bastions",
                    "honey_marker": "TRAP-DB-INFRA",
                },
            },
        ]

        for canary in canaries:
            upsert_decoy_resource(
                db=db,
                resource_id=canary["resource_id"],
                name=canary["name"],
                resource_type=canary["resource_type"],
                classification=canary["classification"],
                fake_path=canary["fake_path"],
                canary_token=canary["canary_token"],
                metadata_json=canary["metadata_json"],
            )
            counts["decoy_resources"] += 1

        # 4. Initial System Event
        existing_event = db.query(SecurityEvent).first()
        if not existing_event:
            init_event = SecurityEvent(
                id=f"EVT-{secrets.token_hex(4).upper()}",
                event_type="system_database_initialized",
                severity="info",
                environment="production",
                message="TokenTrap database schema and honey-token registries initialized.",
                source="127.0.0.1",
                details={"engine": db.bind.dialect.name if db.bind else "postgresql"},
                timestamp=datetime.now(timezone.utc),
            )
            db.add(init_event)
            db.commit()
            counts["events"] += 1

        logger.info("Database seeding complete: %s", counts)
        return counts

    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    res = seed_database()
    print("Seed result:", res)
