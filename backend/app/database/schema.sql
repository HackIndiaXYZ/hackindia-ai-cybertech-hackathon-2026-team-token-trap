-- ============================================================================
-- TokenTrap — Deception-Based Cybersecurity Platform
-- PostgreSQL Database Initialization Schema (DDL)
-- ============================================================================

-- Ensure required PostgreSQL extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Users Table (Genuine Administrators & Decoy Accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    account_mode VARCHAR(50) NOT NULL DEFAULT 'genuine', -- 'genuine' | 'decoy'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_account_mode ON users(account_mode);

-- ============================================================================
-- 2. Security Events Table (Audit Log & Telemetry Ring)
-- ============================================================================
CREATE TABLE IF NOT EXISTS security_events (
    id VARCHAR(64) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low', 'info'
    environment VARCHAR(50) NOT NULL DEFAULT 'security',
    message TEXT NOT NULL,
    session_id VARCHAR(100),
    source VARCHAR(100) NOT NULL DEFAULT '127.0.0.1',
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_env ON security_events(environment);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_session ON security_events(session_id);
-- Fast PostgreSQL GIN index for JSONB deep querying
CREATE INDEX IF NOT EXISTS idx_security_events_details_gin ON security_events USING gin (details);

-- ============================================================================
-- 3. Decoy Resources Table (Honey-Tokens, Canary Files & Traps)
-- ============================================================================
CREATE TABLE IF NOT EXISTS decoy_resources (
    id VARCHAR(64) PRIMARY KEY, -- e.g. 'DECOY-001'
    name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- 'document', 'credential', 'database_dump'
    classification VARCHAR(100) NOT NULL DEFAULT 'Confidential',
    fake_path VARCHAR(255) NOT NULL,
    canary_token VARCHAR(255) NOT NULL UNIQUE,
    activation_count INT NOT NULL DEFAULT 0,
    last_activated_at TIMESTAMPTZ,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decoy_resources_canary ON decoy_resources(canary_token);
CREATE INDEX IF NOT EXISTS idx_decoy_resources_type ON decoy_resources(resource_type);

-- ============================================================================
-- 4. Decoy Sessions Table (Intruder Tracking & Sandboxing Registry)
-- ============================================================================
CREATE TABLE IF NOT EXISTS decoy_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    client_ip VARCHAR(100) NOT NULL DEFAULT '127.0.0.1',
    user_agent TEXT,
    environment VARCHAR(50) NOT NULL DEFAULT 'decoy_sandbox',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_decoy_sessions_subject ON decoy_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_decoy_sessions_active ON decoy_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_decoy_sessions_last_seen ON decoy_sessions(last_seen_at DESC);

-- ============================================================================
-- 5. AI Copilot Conversations Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255),
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    model VARCHAR(100) NOT NULL DEFAULT 'gemini-2.5-flash',
    source VARCHAR(50) NOT NULL DEFAULT 'gemini',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_email);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created ON ai_conversations(created_at DESC);

-- ============================================================================
-- Trigger Function for Automatic updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Initial Demo Seed Data
-- ============================================================================

-- Seed Genuine Admin and Decoy User
INSERT INTO users (email, password_hash, role, account_mode)
VALUES 
    ('admin@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$uEJKmdPx2eRKpsX0W/u9Bg$ZMgLXr+4iDGZqF4rvT7fPq3Dnzn2+cIuIrz6zDd5/rs', 'super_admin', 'genuine'),
    ('visitor@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$mmowQJvIKSIn0o/WRJINEA$RfzB59n2DbudqzpZLETHm6QMcLWB63mKFmeFFIAj3OM', 'decoy_guest', 'decoy')
ON CONFLICT (email) DO NOTHING;

-- Seed Synthetic Honey-Token Canary Resources
INSERT INTO decoy_resources (id, name, resource_type, classification, fake_path, canary_token, metadata_json)
VALUES 
    (
        'DECOY-001',
        'Confidential_Strategy_DRAFT.pdf',
        'document',
        'Top Secret',
        '/var/secure/docs/Confidential_Strategy_DRAFT.pdf',
        'CANARY_TOKEN_STRAT_2026_X9',
        '{"file_size": "2.4 MB", "author": "Chief Strategy Officer", "honey_marker": "TRAP-CANARY-ALPHA"}'::jsonb
    ),
    (
        'DECOY-002',
        'Internal_Credentials_Archive.txt',
        'credential',
        'Confidential',
        '/etc/vault/internal_credentials.txt',
        'CANARY_TOKEN_CRED_ARCHIVE_99',
        '{"file_size": "48 KB", "keys_simulated": 12, "honey_marker": "TRAP-CANARY-BETA"}'::jsonb
    ),
    (
        'DECOY-003',
        'Synthetic_Database_Backup.sql',
        'database_dump',
        'Restricted',
        '/backups/db/production_dump_20260301.sql',
        'CANARY_TOKEN_DB_DUMP_SYNTH_01',
        '{"file_size": "85.2 MB", "tables_simulated": 34, "honey_marker": "TRAP-CANARY-GAMMA"}'::jsonb
    ),
    (
        'HONEY-CRED-01',
        'AWS_Production_Keys_CANARY.json',
        'credential',
        'Critical Decoy',
        '/root/.aws/credentials.canary',
        'CANARY_TOKEN_AWS_ROOT_001',
        '{"fake_access_key": "AKIA_FAKE_CANARY_ACCESS_KEY_01", "region": "us-east-1", "honey_marker": "TRAP-CANARY-DELTA"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;
