# TokenTrap — Deception-Based Cybersecurity Monitoring System

> **HackIndia AI CyberTech Hackathon 2026 — Team Token Trap**  
> **Architecture:** React + Vite frontends, FastAPI backend, Argon2id hashing, dual-key JWT cryptographic separation.

---

## 1. Overview & Architecture

**TokenTrap** is an intelligent deception-based defense monitoring platform. It uses honey-tokens, canary documents, and cryptographically isolated environments to detect, track, and monitor unauthorized intruders in real time without giving them access to real administrative data or sensitive records.

The system consists of three interconnected components:

1. **Security Monitoring Center (`http://localhost:5173`)**
   - High-tech Security Operations Center (SOC) dashboard.
   - Requires genuine administrative authentication.
   - Displays backend-derived live metrics (Authentication Attempts, Honey-Token Activations, Active Decoy Sessions, Blocked API Requests).
   - Real-time Security Event Stream with search and multi-criteria filters (severity, environment).
   - Interactive activity charts (Authentication attempts & threat incidents over time).
   - **Dark Mode / Light Mode toggle** for customizable viewing contrast.

2. **Protected Environment Portal (`http://localhost:5174`)**
   - Independent user-facing authentication portal.
   - Dual-mode routing enforced strictly by the backend:
     - **Genuine Account (`admin@gmail.com`)**: Routes to a verified protected workspace showing operational telemetry fetched from `/api/admin/overview`.
     - **Decoy Account (`visitor@gmail.com`)**: Routes to an isolated sandbox displaying synthetic documents (`Confidential_Strategy_DRAFT.pdf`, `Internal_Credentials_Archive.txt`, `Synthetic_Database_Backup.sql`).
   - Interactive canary activations: clicking or inspecting a decoy resource calls `POST /api/decoy/resources/{id}/activate`, instantly recording a high-severity honey-token activation event in the backend.
   - **Dark Mode / Light Mode toggle** for seamless user experience.

3. **FastAPI Central Backend (`http://localhost:8000`)**
   - Centralized authentication with Argon2id password verification.
   - Cryptographically separated JWT signing (distinct signing keys, issuers, and audiences for genuine and decoy tokens).
   - Dual-verifier authorization guards that strictly reject decoy tokens on administrative endpoints.
   - Thread-safe security event logging and dynamic metrics aggregation.
   - Active decoy session tracking with automated timeout cleanup.
   - Sliding-window rate limiting for repeated login failure protection.

---

## 2. Service URLs

| Component | Development URL | Purpose |
|---|---|---|
| **Security Monitoring Center** | `http://localhost:5173` | Administrator SOC dashboard & live event stream |
| **Protected Environment** | `http://localhost:5174` | Enterprise portal & simulated decoy workspace |
| **FastAPI Backend** | `http://localhost:8000` | Authentication, telemetry, and deception API |
| **API Documentation (Swagger)** | `http://localhost:8000/docs` | Interactive Swagger API explorer |
| **API Health Check** | `http://localhost:8000/api/health` | Backend status and UTC timestamp |

---

## 3. Directory Layout

```text
hackindia-ai-cybertech-hackathon-2026-team-token-trap/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   └── routes.py          # /api/ai/chat Google Gemini AI Copilot
│   │   ├── auth/
│   │   │   ├── routes.py          # Login, logout, canary activations, admin overview
│   │   │   └── tokens.py          # Dual-key JWT issue and verification logic
│   │   ├── database/
│   │   │   ├── connection.py      # PostgreSQL (psycopg) engine, pooling & session generator
│   │   │   ├── models.py          # SQLAlchemy 2.0 ORM entities (Users, Events, Canaries, Sessions)
│   │   │   ├── repository.py      # CRUD repository methods for telemetry & deception
│   │   │   ├── seed.py            # Database seeder for demo accounts & canaries
│   │   │   └── schema.sql         # Pure PostgreSQL DDL with GIN indexing & triggers
│   │   ├── monitoring/
│   │   │   ├── events.py          # Bounded event store, metrics derivation, session tracker
│   │   │   └── routes.py          # /api/monitoring/events & /api/monitoring/summary
│   │   ├── config.py              # Pydantic Settings configuration (PostgreSQL & Gemini)
│   │   └── main.py                # FastAPI initialization, CORS, DB lifespan & health checks
│   ├── tests/
│   │   ├── test_database.py       # Comprehensive PostgreSQL/ORM model & query tests
│   │   ├── test_routes.py         # End-to-end route, activation, and auth tests
│   │   └── test_tokens.py         # JWT key separation and verifier tests
│   ├── requirements.txt           # Python backend dependencies
│   ├── .env                       # Local secrets (never committed)
│   └── .env.example               # Configuration template
├── docker-compose.yml             # PostgreSQL 16 Alpine container with healthchecks
├── frontend/                      # Security Monitoring Center (Port 5173)
│   ├── src/
│   │   ├── api/client.js          # API client for monitoring & auth
│   │   ├── components/Login.jsx   # Admin login with Dark/Light mode toggle
│   │   ├── Dashboard.jsx          # SOC dashboard with live metrics, charts, event feed
│   │   ├── App.jsx                # Theme provider and session router
│   │   └── index.css              # Dark/Light theme styles
│   └── package.json
├── protected-portal/              # Protected Environment (Port 5174)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx          # Dual-target portal login with Dark/Light toggle
│   │   │   ├── GenuineWorkspace.jsx # Genuine administrator telemetry view
│   │   │   └── DecoyWorkspace.jsx   # Interactive canary documents workspace
│   │   ├── api.js                 # Portal API connector
│   │   ├── App.jsx                # Session router & theme state
│   │   └── index.css              # CyberTech CSS styles
│   └── package.json
└── README.md
```

---

## 4. Environment Configuration

Configuration is loaded from `backend/.env`. A safe template is provided in `backend/.env.example`.

### Generating Argon2id Password Hashes
Use the installed `argon2-cffi` library to hash passwords:
```bash
python -c "from argon2 import PasswordHasher; ph = PasswordHasher(); print(ph.hash('YourPasswordHere'))"
```

### Generating Strong JWT Secrets (256-bit)
Generate distinct, cryptographically strong secrets for genuine and decoy tokens:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Configured Demo Accounts

| Account Class | Configured Email | Password | Allowed Access |
|---|---|---|---|
| **Genuine Administrator** | `admin@gmail.com` | `Password@123` | SOC Monitoring (:5173), Admin Overview (:5174) |
| **Decoy Honey-Token Account** | `visitor@gmail.com` | `Visitor@123` | Simulated Decoy Workspace (:5174), Canary Documents |

---

## 5. Setup & Run Instructions

### Prerequisites
- Python 3.10+ (Python 3.13 tested)
- Node.js 18+ (Node v24 tested) & npm

### 1. Backend Setup & Run
```bash
cd backend

# Create virtual environment (if not already present)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Security Monitoring Center Setup & Run (:5173)
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### 3. Protected Environment Portal Setup & Run (:5174)
```bash
cd protected-portal
npm install
npm run dev
# Running on http://localhost:5174
```

---

## 6. Testing & Acceptance Checks

### Running Backend Test Suite
```bash
cd backend
.venv\Scripts\python.exe -m pytest
```
*Result: 18 tests passing (100% pass rate).*

### Test Coverage Summary:
- Valid genuine credentials receive genuine token.
- Valid decoy credentials receive decoy token.
- Invalid credentials return 401 Unauthorized.
- Genuine token allows access to `/api/admin/overview`.
- Decoy token is strictly rejected on `/api/admin/overview`.
- Decoy token allows access to `/api/decoy/documents`.
- Genuine token is rejected on `/api/decoy/documents`.
- Decoy resource activation (`/api/decoy/resources/DECOY-001/activate`) succeeds and records event.
- Unknown decoy resource ID returns 404.
- Decoy resource activation rejected for genuine token.
- Monitoring endpoints (`/api/monitoring/events`, `/api/monitoring/summary`) require genuine administrator token.
- Event records do not expose passwords, hashes, or tokens.
- Health endpoint responds with 200 OK.

### Frontend Builds
```bash
# Build Security Monitoring Center
cd frontend && npm run build

# Build Protected Environment
cd protected-portal && npm run build
```
*Both Vite applications build cleanly with 0 errors.*

---

## 7. End-to-End Demonstration Steps

1. **Verify Backend Health**:
   - Open `http://localhost:8000/api/health` -> returns `{"status": "healthy"}`.
   - Open `http://localhost:8000/docs` -> inspect Swagger documentation.

2. **Open Security Monitoring Center (`http://localhost:5173`)**:
   - Sign in using `admin@gmail.com` / `Password@123`.
   - Toggle between **Dark Mode** and **Light Mode** using the theme button in the header.
   - Note the metric cards and the initial Security Event Stream.

3. **Open Protected Portal (`http://localhost:5174`)**:
   - In a separate browser tab, navigate to `http://localhost:5174`.
   - Attempt an invalid password -> observe immediate generic error `Invalid email or password`.
   - Switch tabs to the Monitoring Center -> verify a `login_failed` event appeared in the feed.

4. **Sign In with Decoy Account**:
   - In Protected Portal (`:5174`), select "Decoy Account".
   - Enter `visitor@gmail.com` / `Visitor@123` and sign in.
   - You are routed to the **Simulated Decoy Workspace**.
   - Notice the list of synthetic files:
     - `Confidential_Strategy_DRAFT.pdf` (`DECOY-001`)
     - `Internal_Credentials_Archive.txt` (`DECOY-002`)
     - `Synthetic_Database_Backup.sql` (`DECOY-003`)

5. **Trigger Honey-Token Canary**:
   - In the Decoy Workspace, click **"Inspect / Open"** on `Confidential_Strategy_DRAFT.pdf`.
   - A modal confirms the canary was activated and logged.
   - Switch to the Monitoring Center (`:5173`) -> verify:
     - **Honey Activations** count increments.
     - A **CRITICAL** severity event `decoy_token_activation` appears in real time.
     - **Active Decoy Sessions** shows `1`.

6. **Verify Security Separation**:
   - If the decoy token is sent to `/api/admin/overview`, the backend rejects it with 401 and records a `genuine_access_rejected` event.
   - In the Protected Portal, click **Sign Out**. The decoy session is terminated and `Active Decoy Sessions` decrements to `0`.

7. **Sign In with Genuine Account on Protected Portal**:
   - Sign in as `admin@gmail.com` / `Password@123`.
   - Notice the portal routes to the **Genuine Protected Workspace**, displaying verified backend telemetry from `/api/admin/overview`.

---

---

## 8. Database Architecture & PostgreSQL Integration

TokenTrap is powered by a production-ready **PostgreSQL database architecture** with SQLAlchemy 2.0 ORM, dual-write telemetry persistence, and fallback resilience:

### Database Schema Tables:
1. **`users`**: Genuine administrators and decoy honey-accounts with Argon2id password hashes, account modes (`genuine` vs `decoy`), and roles.
2. **`security_events`**: Immutable audit logs of authentication attempts, canary interactions, and blocked requests. Uses PostgreSQL `JSONB` with a **GIN index** for sub-millisecond query performance on nested event telemetry.
3. **`decoy_resources`**: Synthetic honeypot canary tokens (`DECOY-001`, `DECOY-002`, `DECOY-003`, `HONEY-CRED-01`, `HONEY-DB-FIN-01`, `HONEY-DB-AUTH-02`, `HONEY-DB-PII-03`, `HONEY-DB-INFRA-04`), tracking activation counts and timestamps.
4. **`decoy_sessions`**: Intruder tracking registry with timeout expiration and logout termination.
5. **`ai_conversations`**: Complete prompt-response audit log for the Google Gemini AI Security Copilot.
6. **`sandbox_audit_logs`**: Detailed intruder activity log capturing every SQL query, table scan, SQL injection attempt, and data exfiltration dump performed by the visitor.

### Starting PostgreSQL with Docker:
A ready-to-run [docker-compose.yml](file:///d:/Projects/Hackindia/hackindia-ai-cybertech-hackathon-2026-team-token-trap/docker-compose.yml) is included:
```bash
# Start PostgreSQL 16 on port 5432 with auto-loaded schema & seed data
docker compose up -d db
```

### Direct PostgreSQL DDL Script:
You can also inspect or execute the pure PostgreSQL DDL directly:
- File: [backend/app/database/schema.sql](file:///d:/Projects/Hackindia/hackindia-ai-cybertech-hackathon-2026-team-token-trap/backend/app/database/schema.sql)
- Contains all `CREATE TABLE`, `CREATE INDEX`, GIN indexes, `updated_at` trigger functions, and default seed statements.

### Database Health & Status Endpoint:
- Check real-time database connectivity and table counts at `http://localhost:8000/api/database/status`.
- Database status is also included in `http://localhost:8000/api/health`.
