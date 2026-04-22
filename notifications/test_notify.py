"""Standalone script to verify the LINE notifier is wired up correctly."""

import sys
from pathlib import Path

# Allow running from any directory
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv  # noqa: E402  # optional if python-dotenv installed

# Load .env if present (graceful no-op if dotenv not installed)
try:
    load_dotenv(Path(__file__).parent.parent / ".env")
except ImportError:
    pass

from notifications.line_notifier import LineNotifier  # noqa: E402


def main() -> None:
    try:
        notifier = LineNotifier()
    except EnvironmentError as e:
        print(f"Setup error: {e}")
        print("Copy .env.example to .env and fill in your credentials.")
        sys.exit(1)

    success = notifier.push(
        "ROUNDS.ai notifier is live. Day 0 complete. 🚀",
        priority="checkpoint",
    )

    if success:
        print("Test message sent successfully.")
    else:
        print("Failed to send test message. Check credentials and logs/line/.")
        sys.exit(1)


if __name__ == "__main__":
    main()
