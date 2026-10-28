# TokenTrap — Antigravity Implementation Plan

> **Project:** TokenTrap — Deception-Based Cybersecurity Monitoring System  
> **Purpose:** Implementation brief for Antigravity to complete the existing project as a working local MVP.  
> **Target sprint:** 2 hours  
> **Architecture:** React + Vite frontends, FastAPI backend, JWT authentication

---

## 1. Objective

Complete the existing **Team Token Trap** project without replacing working code. The MVP consists of two separate web applications connected to one FastAPI backend:

1. **Security Monitoring Center** — an administrator-only dashboard for authentication activity, honey-token interactions, decoy sessions, blocked requests, and event logs.
2. **Protected Environment** — a separate login portal that routes a successfully authenticated genuine account to a protected demo workspace and a configured decoy account to an isolated simulated workspace.
3. **FastAPI backend** — centralized authentication, token validation, authorization, event recording, monitoring metrics, and decoy-resource interaction tracking.

This is a local demonstration prototype, not a production identity provider or a claim of production-grade security.

## 2. Target URLs

| Component | Development URL | Purpose |
|---|---|---|
| Security Monitoring Center | `http://localhost:5173` | Admin dashboard |
| Protected Environment | `http://localhost:5174` | Login and simulated workspaces |
| FastAPI backend | `http://localhost:8000` | Authentication and monitoring API |
| API documentation | `http://localhost:8000/docs` | Inspect and test API routes |

Keep the repository's current structure where practical. Create `protected-portal/` only if a separate portal does not already exist.

## 3. Instructions for Antigravity

Antigravity should **inspect, implement, run, and test** the existing project—not just explain how to build it.

1. Inspect the repository before editing: frontend files, backend routes, token utilities, event storage, settings, dependencies, tests, and README.
2. Preserve working features and current API contracts wherever possible.
3. Do not replace the project with boilerplate or rewrite functioning authentication without a clear need.
4. Work directly in existing files and add only necessary files.
5. Reuse installed dependencies when possible.
6. Run existing tests before and after important changes when practical.
7. Do not claim a test or build passed unless it was actually executed successfully.
8. If a blocker appears, report the exact error and continue with independent tasks.
9. Prioritize a working end-to-end flow over decorative features.
10. At the end, list modified/created files, actual test results, run commands, manual setup, and remaining limitations.

## 4. Two-Hour Priority Schedule

| Time | Priority | Deliverable |
|---|---|---|
| 00–10 min | Audit | Understand the current code and identify missing components |
| 10–30 min | Authentication | Genuine/decoy login, token separation, configuration, CORS |
| 30–50 min | Monitoring API | Event recording, summary metrics, event query, decoy interaction |
| 50–75 min | Protected portal | Login, genuine workspace, simulated decoy workspace |
| 75–95 min | Monitoring UI | Backend-driven metrics, event table, filters, refresh |
| 95–110 min | Verification | Backend tests, frontend builds, local end-to-end checks |
| 110–120 min | Wrap-up | README accuracy, run instructions, limitations, demo checklist |

These are priorities, not a reason to leave critical authentication or integration failures unresolved. If time is limited, prioritize authentication, event recording, real dashboard integration, and the end-to-end demonstration.

---

## 5. Architecture and Suggested Structure

Use the existing structure and adapt this layout as needed:

```text
Team Token Trap/
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── monitoring/
│   │   ├── config.py
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env                 # Local secrets; never commit
├── frontend/                # Security Monitoring Center
│   ├── src/
│   └── package.json
├── protected-portal/        # Create only if not already present
│   ├── src/
│   └── package.json
└── README.md
```

### Component responsibilities

- **Monitoring frontend:** display backend-derived security metrics and events; require genuine admin authentication.
- **Protected portal:** collect credentials, submit them to the backend, and display the workspace matching the token returned by the backend.
- **Backend:** decide authentication and authorization, issue and validate tokens, record security events, and calculate monitoring metrics.

The frontend must never be the authority that decides whether an account is genuine or decoy.

## 6. Authentication and Access Control

Implement or verify two separate account modes.

### Genuine account

- Read account configuration and password hash from backend environment settings.
- Verify the password using the project's existing password-hashing library.
- Issue a genuine JWT after successful authentication.
- Permit access only to genuine administrative endpoints.
- Return appropriate authorization errors for missing, malformed, expired, incorrectly signed, or wrong-type tokens.

### Decoy account

- Read decoy account configuration and password hash from backend settings.
- Issue a decoy JWT using a cryptographically separate signing key or the existing secure token-separation design.
- Permit access only to designated decoy resources.
- Reject decoy tokens on genuine administrative endpoints.
- Record decoy session and resource interactions as security events.

### Invalid credentials

- Record a `login_failed` event.
- Return a generic message such as `Invalid email or password`.
- Permit retry.
- Never log submitted passwords, password hashes, JWTs, or raw Authorization headers.
- Add lightweight rate limiting or repeated-failure protection if feasible within the sprint.

### Token validation

Validate signature, expiry, issuer, audience, and token type as supported by the current implementation. Keep token lifetimes short and configurable. Development-only token-creation routes must be unavailable outside development mode.

Do not put signing secrets in frontend code or frontend environment variables.

## 7. Protected Environment Website

**Target:** `http://localhost:5174`

Build a responsive, polished login page with:

- TokenTrap branding and a concise security message
- Email/authentication ID and password fields
- Password show/hide control
- Sign-in button and loading state
- Generic login error
- Backend unavailable/error state
- Clear indication that this is an isolated demo environment

Use the existing API request and response schemas. If compatible with the current backend, the login request may resemble:

```json
{
  "email": "configured-account@example.com",
  "password": "entered-password",
  "mode": "real"
}
```

Use the supported decoy mode for the configured decoy account. The backend—not a frontend selection control—must determine authorization.

### Genuine workspace

After genuine login, show a basic protected workspace containing:

- Welcome panel
- Genuine environment indicator
- Session status
- Safe data fetched from a genuine-only backend endpoint
- Logout button

Do not expose real sensitive records.

### Decoy workspace

After decoy login, show an isolated simulated workspace with synthetic resources such as:

- Simulated reports
- A simulated strategy document
- A simulated credentials archive
- Decoy activity panel
- Logout button

Mark resources as synthetic in the underlying data model. Do not use actual credentials, real secrets, personal records, or genuine confidential documents.

Opening a designated decoy resource must call the backend. Do not record activations only in browser state.

### Session behavior

- Keep access tokens in memory where practical.
- If a session cannot be safely restored after reload, return to login.
- Clear application session state on logout.
- Do not log tokens to the browser console.
- Document the prototype's session limitations.

## 8. Security Monitoring Center

**Target:** `http://localhost:5173`

Preserve the current frontend and visual identity where reasonable. Use a professional, responsive security-operations style with accessible contrast, clear typography, and reusable components.

### Suggested navigation

- Overview
- Authentication Activity
- Honey-Token Activity
- Decoy Sessions
- Blocked Requests
- Event Logs
- System Health

### Metric cards

Show:

1. Authentication Attempts
2. Honey-Token Activations
3. Active Decoy Sessions
4. Blocked API Requests

Optional additional metrics:

- Successful logins
- Failed logins
- High-severity events

All values must come from backend event records or backend-maintained session state. Do not present hardcoded values as live results. If there is no activity, show zero and a useful empty state. Clearly label any sample/demo data as simulated.

Define each metric so a single incident is not unintentionally counted multiple times.

### Charts

Reuse an installed charting library if available. Otherwise use a lightweight or CSS-based chart. Display:

- Authentication activity over time
- Event severity distribution
- Event type distribution

Charts must use backend data or be clearly marked as simulated. Empty datasets must not crash the UI.

### Event table

Include:

- Timestamp
- Event type
- Severity
- Environment
- Safe event description
- Non-secret session/source identifier if available

Add search, severity filter, event-type filter, environment filter, bounded results or pagination, refresh, and useful loading/error/empty states.

Do not show passwords, password hashes, JWTs, signing keys, or raw Authorization headers. Do not add event deletion unless explicitly required by the existing project.

### Dashboard authentication

The monitoring UI should require genuine administrative authentication. Frontend route protection is for user experience only; backend endpoints must enforce authorization.

## 9. Backend Monitoring and Events

Inspect and reuse the current event system first. If events are currently stored in memory, that is acceptable for this MVP if the limitation is documented. Do not claim in-memory data persists after server restart.

Use UTC timestamps and a consistent event schema equivalent to:

```json
{
  "id": "unique-event-id",
  "timestamp": "UTC ISO-8601 timestamp",
  "event_type": "login_failed",
  "severity": "medium",
  "environment": "genuine",
  "message": "A login attempt failed credential verification.",
  "session_id": null
}
```

Adapt this schema to the existing implementation. Never include passwords, password hashes, tokens, signing keys, or raw authentication headers in event records.

### Event types to implement or adapt

- `login_succeeded`
- `login_failed`
- `decoy_session_started`
- `decoy_document_access`
- `decoy_token_activation`
- `genuine_access_rejected`
- `decoy_access_rejected`
- `blocked_api_request`
- `logout`
- `system_error` where useful

Define which event types contribute to each metric. A failed login is not itself a honey-token activation. Count a honey-token activation only when a designated decoy resource or credential is actually interacted with.

### Required or equivalent endpoints

Reuse existing routes when compatible. Do not break current API contracts just to match these names.

| Endpoint | Purpose | Access |
|---|---|---|
| `GET /api/health` | Backend health and UTC timestamp | Public health status |
| `POST /api/auth/login` | Authenticate genuine/decoy accounts | Public, rate-limited if feasible |
| `GET /api/admin/overview` | Safe genuine workspace data | Genuine token only |
| `GET /api/decoy/documents` | Synthetic decoy resources | Decoy token only |
| `GET /api/monitoring/events` | Bounded/filterable security event list | Genuine token only |
| `GET /api/monitoring/summary` | Backend-derived metric counts | Genuine token only |
| `POST /api/decoy/resources/{resource_id}/activate` | Record a designated decoy interaction | Decoy token only |

The activation endpoint must validate the resource ID against an explicit set of synthetic resources. Unknown IDs must not be counted as valid activations.

Track active decoy sessions simply and safely. Expired sessions must not remain active indefinitely. Document simplifications.

## 10. CORS and Environment Configuration

Allow only the required local development origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5174`

Use the existing configuration mechanism. Do not use unrestricted wildcard origins with credentials, and do not broaden production origins.

Check local `.env` configuration without printing its contents. Verify that:

- Every environment assignment is on its own line.
- Variable names match the settings model.
- Password hashes are valid for the configured hashing library.
- Genuine and decoy signing secrets are strong, distinct values.
- The application loads configuration from the intended working directory.

Do not overwrite a valid `.env` with placeholders. If a secret was exposed in chat or committed to source control, recommend rotation. Never ask the user to paste secrets into chat.

## 11. Testing and Acceptance Checks

Use the project's existing test framework. Run existing tests before and after changes where practical. Add or update tests for the following behaviors.

### Authentication and authorization

- Valid genuine credentials receive a genuine token.
- Valid decoy credentials receive a decoy token.
- Invalid credentials return 401.
- Genuine token works on the genuine endpoint.
- Decoy token is rejected on the genuine endpoint.
- Decoy token works only on intended decoy endpoints.
- Expired, malformed, incorrectly signed, or wrong-type tokens are rejected.
- Missing or malformed Authorization header returns 401.
- Development-only token routes are unavailable outside development.

### Monitoring

- Genuine administrator can retrieve events and summary.
- Decoy visitor cannot retrieve monitoring data.
- Failed login creates `login_failed`.
- Decoy login creates the configured session/login events.
- Decoy resource interaction creates an event.
- Dashboard counts update from events.
- Unknown decoy resource IDs are rejected.
- Event records contain no passwords or tokens.
- Health endpoint responds successfully.

### End-to-end demonstration

1. Start the backend.
2. Open the monitoring center and sign in as the genuine administrator.
3. Open the protected portal.
4. Attempt an invalid login and verify that the failure appears in monitoring.
5. Sign in with the configured decoy account.
6. Verify that the simulated decoy workspace appears.
7. Open a designated decoy resource and verify that the event appears in monitoring.
8. Confirm the relevant metric updates according to its definition.
9. In a controlled local test, verify that a decoy token is rejected by a genuine administrative endpoint.
10. Log out and verify that frontend session state is cleared.

Test only this local application and its own APIs. Do not run destructive tests, real attack traffic, or unauthorized scans.

## 12. README and Run Instructions

Update the project README with:

- Project overview and architecture
- Directory structure
- Prerequisites
- Backend setup
- Monitoring frontend setup
- Protected portal setup
- Environment configuration without real secrets
- Password-hash generation instructions using the installed library
- Separate JWT secret configuration guidance
- API endpoint overview
- Test commands
- End-to-end demo steps
- Known limitations and security notes

Reuse the existing virtual environment and dependency files where possible. Do not create unnecessary environments or replace dependencies blindly.

The expected service URLs are:

- Monitoring Center: `http://localhost:5173`
- Protected Environment: `http://localhost:5174`
- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

Generate exact commands based on the actual repository and installed package manager.

## 13. Final Acceptance Criteria

The sprint is complete when:

- [ ] Existing project was inspected and working functionality preserved.
- [ ] Backend starts successfully.
- [ ] Monitoring frontend starts successfully.
- [ ] Protected portal runs independently on port 5174.
- [ ] Genuine login works.
- [ ] Decoy login works.
- [ ] Invalid login attempts are recorded.
- [ ] Genuine and decoy authorization are enforced by the backend.
- [ ] Decoy workspace uses synthetic resources.
- [ ] Designated decoy interactions create backend events.
- [ ] Monitoring UI retrieves real backend events.
- [ ] Dashboard metrics derive from backend data.
- [ ] Filters and refresh work.
- [ ] Loading, error, and empty states work.
- [ ] Secrets and credentials are not exposed in source or logs.
- [ ] Existing tests and relevant new tests have been run.
- [ ] Frontend builds succeed if supported by the repository.
- [ ] Local end-to-end workflow succeeds.
- [ ] README instructions match the actual implementation.
- [ ] Remaining limitations are documented.

## 14. Required Final Report from Antigravity

At completion, report:

1. Features implemented.
2. Files created or modified.
3. Exact commands to start all services.
4. URLs for both websites, backend, and API docs.
5. Tests/builds actually executed and their observed results.
6. Configured account identifiers only if safe to disclose—never passwords, hashes, or tokens.
7. Required manual setup.
8. Known limitations and unfinished work.
9. Exact steps for demonstrating the complete workflow.

## 15. Start Work Now

Inspect the repository, create a concise implementation checklist, and begin working directly in the project.

Do not stop after creating UI mockups. Complete the authentication, backend event pipeline, frontend integration, tests, and documentation in priority order. Preserve working code, use safe defaults, and report actual results.
