"""LINE Messaging API push notification client for ROUNDS.ai dev alerts."""

import json
import os
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

_PRIORITY_EMOJI = {
    "emergency": "🚨",
    "checkpoint": "📋",
    "progress": "✅",
    "normal": "💬",
}

_LINE_API_URL = "https://api.line.me/v2/bot/message/push"
_LOG_DIR = Path(__file__).parent.parent / "logs" / "line"


class LineNotifier:
    def __init__(self) -> None:
        self.token = os.environ.get("LINE_CHANNEL_ACCESS_TOKEN", "")
        self.user_id = os.environ.get("LINE_USER_ID", "")
        if not self.token or not self.user_id:
            raise EnvironmentError(
                "LINE_CHANNEL_ACCESS_TOKEN and LINE_USER_ID must be set in environment."
            )

    def push(self, message: str, priority: str = "normal") -> bool:
        """Send a push message to the developer via LINE.

        Returns True on HTTP 200, False on any failure.
        """
        emoji = _PRIORITY_EMOJI.get(priority, _PRIORITY_EMOJI["normal"])
        full_message = f"{emoji} [ROUNDS.ai] {message}"

        success = self._send(full_message)
        self._log(priority, message, success)
        return success

    def _send(self, text: str) -> bool:
        payload = json.dumps({
            "to": self.user_id,
            "messages": [{"type": "text", "text": text}],
        }).encode("utf-8")

        req = urllib.request.Request(
            _LINE_API_URL,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.token}",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.status == 200
        except urllib.error.HTTPError as e:
            print(f"LINE API error {e.code}: {e.read().decode()}")
            return False
        except Exception as e:
            print(f"LINE send failed: {e}")
            return False

    def _log(self, priority: str, message: str, success: bool) -> None:
        _LOG_DIR.mkdir(parents=True, exist_ok=True)
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        log_path = _LOG_DIR / f"{date_str}.log"

        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        status = "OK" if success else "FAIL"
        entry = f"{timestamp} [{status}] [{priority.upper()}] {message}\n"

        with open(log_path, "a", encoding="utf-8") as f:
            f.write(entry)
