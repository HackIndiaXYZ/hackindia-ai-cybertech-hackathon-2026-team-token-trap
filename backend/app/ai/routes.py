from __future__ import annotations

import os
from typing import Any, Optional
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.monitoring.events import get_monitoring_summary, list_events

router = APIRouter(prefix="/api/ai", tags=["AI Copilot"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    api_key: Optional[str] = None
    history: Optional[list[ChatMessage]] = None
    context: Optional[dict[str, Any]] = None


SYSTEM_PROMPT = """You are the TokenTrap AI Security Copilot, an expert cybersecurity assistant embedded directly inside the TokenTrap Deception Intelligence SOC Dashboard.

Key Platform Knowledge:
1. **Core Purpose**: TokenTrap is an advanced deception-based cybersecurity monitoring platform built for the HackIndia AI CyberTech Hackathon 2026. It detects, isolates, and monitors unauthorized intruders using honey-tokens, canary documents, and cryptographically distinct simulated sandboxes without exposing actual sensitive company assets.
2. **Two Separate Web Applications**:
   - **Security Monitoring Center (http://localhost:5173)**: SOC dashboard for administrators. Provides live metric cards, threat activity charts, a real-time security event feed with filters, and a Dark/Light mode theme switcher.
   - **Protected Environment (http://localhost:5174)**: The user login portal. Routes genuine accounts (`admin@gmail.com`) to the Genuine Workspace (/api/admin/overview) and decoy accounts (`visitor@gmail.com`) to an isolated Simulated Decoy Workspace.
3. **Deception & Honey-Tokens**:
   - Synthetic files include `Confidential_Strategy_DRAFT.pdf` (`DECOY-001`), `Internal_Credentials_Archive.txt` (`DECOY-002`), `Synthetic_Database_Backup.sql` (`DECOY-003`), and `HONEY-CRED-01`.
   - Interacting with any canary file calls `POST /api/decoy/resources/{id}/activate`, generating an immediate `CRITICAL` alert on the SOC dashboard.
4. **Security & Cryptography**:
   - Uses Argon2id password hashing.
   - Dual-key JWT architecture: genuine and decoy tokens are signed with cryptographically separate secrets. Any attempt by a decoy token to access administrative endpoints is immediately rejected (401) and logged as a `genuine_access_rejected` event.
   - Sliding-window rate limiting prevents brute-force credential stuffing.

When answering, be concise, professional, insightful, and helpful. Use clear markdown formatting."""


def generate_builtin_reply(query: str, current_metrics: dict[str, Any]) -> str:
    """Intelligent built-in fallback analysis if no Gemini API key is configured."""
    q = query.lower()

    if any(k in q for k in ["what is tokentrap", "what does tokentrap do", "overview", "about"]):
        return (
            "### 🛡️ What is TokenTrap?\n\n"
            "**TokenTrap** is a **deception-based cybersecurity defense platform** developed for the HackIndia Hackathon 2026.\n\n"
            "Rather than merely blocking intruders at the perimeter, TokenTrap traps them in an **isolated decoy sandbox** populated with synthetic honey-tokens (fake strategy docs, canary database dumps, and mock credentials). "
            "When an attacker attempts to interact with these canaries, TokenTrap records high-fidelity security alerts on this dashboard without exposing real data."
        )

    if any(k in q for k in ["metric", "current metric", "numbers", "stats", "telemetry", "count"]):
        m = current_metrics
        return (
            "### 📊 Current Live SOC Telemetry\n\n"
            f"- **Authentication Attempts:** {m.get('authentication_attempts', 0)} (Total real + decoy logins)\n"
            f"- **Honey-Token Activations:** {m.get('honey_token_activations', 0)} (Intruder interactions with canary files)\n"
            f"- **Active Decoy Sessions:** {m.get('active_decoy_sessions', 0)} (Intruders currently inside the sandbox)\n"
            f"- **Blocked API Requests:** {m.get('blocked_api_requests', 0)} (Unauthorized access attempts & rate limits)\n"
            f"- **Successful Logins:** {m.get('successful_logins', 0)} | **Failed Logins:** {m.get('failed_logins', 0)}\n\n"
            "*All metrics are computed in real time from backend security audit events.*"
        )

    if any(k in q for k in ["honey token", "canary", "fake document", "decoy-001"]):
        return (
            "### 🍯 Honey Tokens & Canary Documents\n\n"
            "Honey tokens are synthetic digital traps. In TokenTrap, they include:\n\n"
            "1. **`DECOY-001`**: `Confidential_Strategy_DRAFT.pdf` (Executive strategy canary)\n"
            "2. **`DECOY-002`**: `Internal_Credentials_Archive.txt` (Synthetic DB credentials)\n"
            "3. **`DECOY-003`**: `Synthetic_Database_Backup.sql` (Simulated customer database)\n"
            "4. **`HONEY-CRED-01`**: `Decoy Service Account Key`\n\n"
            "Whenever a visitor inside `http://localhost:5174` clicks **'Inspect / Open'**, the backend logs a **CRITICAL** severity event `decoy_token_activation`."
        )

    if any(k in q for k in ["how to test", "attack flow", "demo", "demonstration", "try it"]):
        return (
            "### 🧪 How to Demonstrate TokenTrap\n\n"
            "1. Open the **Protected Portal** at [http://localhost:5174](http://localhost:5174).\n"
            "2. Try an invalid password to see the generic error and watch the failure appear in this dashboard.\n"
            "3. Select **Decoy Account**, enter `visitor@gmail.com` / `Visitor@123`, and sign in.\n"
            "4. Inside the simulated workspace, click **Inspect / Open** on `Confidential_Strategy_DRAFT.pdf`.\n"
            "5. Return to this dashboard to watch the **Honey Activations** counter increase and the alert stream update in real time!"
        )

    if any(k in q for k in ["dark mode", "light mode", "theme"]):
        return (
            "### 🌓 Dark / Light Mode Support\n\n"
            "TokenTrap includes full **Dark Mode** and **Light Mode** styling across both web applications!\n"
            "- Click the **Dark / Light button** in the top-right header to toggle themes.\n"
            "- Your theme preference is preserved across page refreshes in `localStorage`."
        )

    return (
        f"### 🤖 TokenTrap Security Copilot\n\n"
        f"I received your question: *\"{query}\"*\n\n"
        "TokenTrap is currently operating normally with defense systems active. "
        "You can ask me about:\n"
        "- **Platform Architecture** (Backend on :8000, SOC on :5173, Portal on :5174)\n"
        "- **Current Telemetry & Alerts** (Honey token activations, decoy sessions)\n"
        "- **Testing an Attack Scenario** (Step-by-step walkthrough)\n"
        "- **Configuring Gemini AI** (Provide your Gemini API key in chat settings for direct LLM generation)\n\n"
        f"*Current live system status: {current_metrics.get('authentication_attempts', 0)} auth attempts, {current_metrics.get('honey_token_activations', 0)} honey activations.*"
    )


@router.post("/chat")
async def chat_with_copilot(req: ChatRequest):
    """Chat with the TokenTrap AI Security Copilot using Google Gemini API."""
    query = req.message.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Fetch live summary metrics for context injection
    summary = get_monitoring_summary()
    current_metrics = summary.get("metrics", {})
    recent_events = list_events(limit=5)

    # Determine effective Gemini API Key
    effective_api_key = (
        req.api_key
        or settings.gemini_api_key
        or os.getenv("GEMINI_API_KEY")
    )

    if effective_api_key and effective_api_key.strip():
        key = effective_api_key.strip()
        context_str = (
            f"\n\nCURRENT LIVE SYSTEM METRICS:\n"
            f"- Authentication Attempts: {current_metrics.get('authentication_attempts', 0)}\n"
            f"- Honey-Token Activations: {current_metrics.get('honey_token_activations', 0)}\n"
            f"- Active Decoy Sessions: {current_metrics.get('active_decoy_sessions', 0)}\n"
            f"- Blocked API Requests: {current_metrics.get('blocked_api_requests', 0)}\n"
            f"- Recent events count: {len(recent_events)}\n"
        )

        # Build contents array for Gemini REST API
        contents = []
        if req.history:
            for msg in req.history[-6:]:
                role = "model" if msg.role in {"model", "assistant"} else "user"
                contents.append({"role": role, "parts": [{"text": msg.content}]})

        # Add current user prompt with live context
        contents.append({
            "role": "user",
            "parts": [{"text": f"{query}\n{context_str}"}],
        })

        gemini_payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 800,
            },
        }

        # Try gemini-2.5-flash then gemini-1.5-flash
        models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash"]
        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(url, json=gemini_payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            reply_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            if reply_text:
                                return {
                                    "reply": reply_text,
                                    "source": "gemini",
                                    "model": model_name,
                                }
            except Exception:
                continue

    # Fallback to smart built-in intelligence
    reply = generate_builtin_reply(query, current_metrics)
    return {
        "reply": reply,
        "source": "builtin_soc_intelligence",
        "model": "tokentrap-rule-engine",
    }
