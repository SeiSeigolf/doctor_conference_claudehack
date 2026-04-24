"""LINE webhook server for ROUNDS.ai developer control.

Receives LINE messages from the developer and responds via Claude,
with full project context loaded at startup.

Usage:
    python notifications/line_bot.py
    (then run ngrok in a separate terminal: ngrok http 8000)
"""

import hashlib
import hmac
import json
import os
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

import anthropic
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────

LINE_ACCESS_TOKEN = os.environ["LINE_CHANNEL_ACCESS_TOKEN"]
LINE_USER_ID = os.environ["LINE_USER_ID"]
LINE_CHANNEL_SECRET = os.environ.get("LINE_CHANNEL_SECRET", "")  # optional for sig verification

ANTHROPIC_CLIENT = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
PROJECT_ROOT = Path(__file__).parent.parent

# ── Project context loader ─────────────────────────────────────────────────────

def load_project_context() -> str:
    """Load key project files to give Claude context about the current state."""
    sections = []

    # CLAUDE.md summary (first 60 lines = constitution core)
    claude_md = PROJECT_ROOT / "CLAUDE.md"
    if claude_md.exists():
        lines = claude_md.read_text().splitlines()[:60]
        sections.append("=== CLAUDE.md (constitution excerpt) ===\n" + "\n".join(lines))

    # Latest session log
    session_dir = PROJECT_ROOT / "logs" / "sessions"
    if session_dir.exists():
        logs = sorted(session_dir.glob("*.md"))
        if logs:
            sections.append(f"=== Latest session log: {logs[-1].name} ===\n" + logs[-1].read_text()[:1000])

    # Git log (last 5 commits)
    import subprocess
    result = subprocess.run(
        ["git", "log", "--oneline", "-5"],
        capture_output=True, text=True, cwd=PROJECT_ROOT
    )
    if result.returncode == 0:
        sections.append("=== Recent commits ===\n" + result.stdout.strip())

    # outputs summary
    outputs_dir = PROJECT_ROOT / "outputs"
    if outputs_dir.exists():
        cases = list(outputs_dir.glob("case*.json"))
        sections.append(f"=== Demo outputs ready: {[c.name for c in cases]} ===")

    return "\n\n".join(sections)


PROJECT_CONTEXT = load_project_context()

SYSTEM_PROMPT = f"""You are a Claude Code AI assistant embedded in the ROUNDS.ai hackathon project.
The developer (Seishiro) is messaging you via LINE to check status and give instructions.

You have full context of the project. Respond in Japanese or English matching the developer's language.
Keep responses concise — LINE messages should be under 500 characters when possible.
For complex tasks, summarize what you would do and note it needs to be done in the main Claude Code session.

Today is {datetime.now(timezone.utc).strftime('%Y-%m-%d')}. Hackathon deadline: 2026-04-27 09:00 JST.

PROJECT CONTEXT:
{PROJECT_CONTEXT}

You can:
- Answer questions about project status
- Summarize what has been built
- Give the developer quick status on any case or component
- Remind the developer of next steps
- Flag concerns or blockers

You cannot directly execute code — for that, the developer needs to be in the main Claude Code session.
"""

# ── LINE API helpers ──────────────────────────────────────────────────────────

def send_reply(reply_token: str, text: str) -> None:
    """Send a reply via LINE reply API (uses replyToken, more efficient than push)."""
    # LINE message limit is 5000 chars; truncate if needed
    if len(text) > 4900:
        text = text[:4897] + "..."

    payload = json.dumps({
        "replyToken": reply_token,
        "messages": [{"type": "text", "text": text}],
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.line.me/v2/bot/message/reply",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {LINE_ACCESS_TOKEN}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10):
            pass
    except urllib.error.HTTPError as e:
        print(f"[LINE reply error] {e.code}: {e.read().decode()}")
    except Exception as e:
        print(f"[LINE reply failed] {e}")


def verify_signature(body: bytes, signature: str) -> bool:
    """Verify LINE webhook signature. Skip if LINE_CHANNEL_SECRET not set."""
    if not LINE_CHANNEL_SECRET:
        return True  # Skip verification in dev — set LINE_CHANNEL_SECRET for production
    mac = hmac.new(LINE_CHANNEL_SECRET.encode("utf-8"), body, hashlib.sha256).digest()
    import base64
    expected = base64.b64encode(mac).decode("utf-8")
    return hmac.compare_digest(expected, signature)


# ── Claude response ────────────────────────────────────────────────────────────

def ask_claude(user_message: str) -> str:
    """Send the developer's message to Claude with project context and return response."""
    response = ANTHROPIC_CLIENT.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )
    block = response.content[0]
    return block.text if block.type == "text" else "(no response)"


# ── FastAPI app ────────────────────────────────────────────────────────────────

app = FastAPI(title="ROUNDS.ai LINE Bot")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "project": "ROUNDS.ai", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/webhook")
async def webhook(request: Request) -> Response:
    body = await request.body()
    signature = request.headers.get("X-Line-Signature", "")

    if not verify_signature(body, signature):
        return Response(status_code=403, content="Invalid signature")

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return Response(status_code=400)

    for event in data.get("events", []):
        # Only handle text messages from the registered developer user
        if event.get("type") != "message":
            continue
        if event.get("message", {}).get("type") != "text":
            continue

        source_user = event.get("source", {}).get("userId", "")
        if source_user != LINE_USER_ID:
            print(f"[ignored] message from unknown user: {source_user}")
            continue

        text = event["message"]["text"].strip()
        reply_token = event.get("replyToken", "")

        print(f"[LINE] received: {text!r}")

        # Ask Claude
        try:
            response_text = ask_claude(text)
        except Exception as e:
            response_text = f"⚠ Claude error: {e}"

        if reply_token:
            send_reply(reply_token, response_text)
            print(f"[LINE] replied: {response_text[:80]}...")

    return Response(status_code=200)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 50)
    print("ROUNDS.ai LINE Bot starting...")
    print(f"  Project root: {PROJECT_ROOT}")
    print(f"  LINE user ID: {LINE_USER_ID[:8]}***")
    print(f"  Listening on: http://localhost:8000")
    print("  Webhook path: /webhook")
    print("=" * 50)
    print("\nNext step: open a new terminal and run:")
    print("  ngrok http 8000")
    print("Then set the ngrok URL as your LINE webhook:")
    print("  https://<ngrok-id>.ngrok-free.app/webhook")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
