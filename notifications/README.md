# Notifications — LINE Messaging API

ROUNDS.ai agents send development alerts to the developer (Seishiro) via LINE
push messages. This module handles all outbound notifications.

## Setup

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   - `LINE_CHANNEL_ACCESS_TOKEN` — from the LINE Developers console (Messaging API channel)
   - `LINE_USER_ID` — your personal LINE user ID (find it via the LINE Developers console or a webhook echo bot)
   - `ANTHROPIC_API_KEY` — your Anthropic API key

3. Source the env (or use `python-dotenv` — see below):
   ```bash
   export $(cat .env | xargs)
   ```

## Run the test

```bash
python notifications/test_notify.py
```

A successful run sends "ROUNDS.ai notifier is live. Day 0 complete. 🚀" to your LINE
account and writes a log entry to `logs/line/YYYY-MM-DD.log`.

> `python-dotenv` is optional. If installed, `test_notify.py` loads `.env` automatically.
> Without it, export env vars manually before running.

## How agents use LineNotifier

```python
from notifications.line_notifier import LineNotifier

notifier = LineNotifier()

# Routine progress update
notifier.push("BUILDER finished LACE index module.", priority="progress")

# Scheduled checkpoint summary
notifier.push("Morning checkpoint: Day 2 plan complete.", priority="checkpoint")

# Blocking issue — requires human response before proceeding
notifier.push("Budget 90% reached. Halting non-essential agents.", priority="emergency")
```

### Priority levels

| Priority    | Emoji | When to use |
|-------------|-------|-------------|
| `emergency` | 🚨    | Patient safety concern, budget hard limit, agent loop detected |
| `checkpoint` | 📋   | Scheduled 09:00 / 13:00 / 21:00 JST summaries |
| `progress`  | ✅    | Milestone completions, module finishes |
| `normal`    | 💬    | General status updates |

All sends are logged to `logs/line/YYYY-MM-DD.log` regardless of success or failure.
