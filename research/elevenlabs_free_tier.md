# ElevenLabs Free Tier — Research Notes

**Researched:** 2026-04-22
**Purpose:** Assess viability for ROUNDS.ai pitch video voiceover (Apr 26)
**Sources:** elevenlabs.io/pricing, elevenlabs.io/docs/api-reference, ElevenLabs help center

---

## Free Tier Limits

| Constraint | Free Tier |
|------------|-----------|
| Monthly credits | **10,000 credits/month** |
| Credits → characters | 1 credit = 1 character (Multilingual v2 model) |
| Effective TTS time | ~10 minutes of audio per month |
| Audio quality cap | 128 kbps, 44.1 kHz (`mp3_44100_128`) |
| Commercial license | ❌ No — attribution to ElevenLabs required |
| Voice cloning | ❌ No — stock voices only |
| Studio projects | 3 max |
| Concurrent requests | 1–2 (not officially published; free tier is lowest priority) |

**Verdict for ROUNDS.ai:** The 5-minute pitch script is ~3,000–4,500 characters.
Well within the 10,000 character monthly limit. Free tier is viable.
Attribution required in video description.

---

## API Key Setup

1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Go to **Settings → API Keys** (`elevenlabs.io/app/settings/api-keys`)
3. Generate a key, copy it immediately (shown once)
4. Add to `.env`:
   ```
   ELEVENLABS_API_KEY=your_key_here
   ```
5. Add `ELEVENLABS_API_KEY` to `.env.example` as a placeholder

---

## Python Snippet — SDK (recommended)

```python
import os
from pathlib import Path
from elevenlabs.client import ElevenLabs

# pip install elevenlabs

client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])

audio = client.text_to_speech.convert(
    text="I am not here. I have not been here for a week.",
    voice_id="JBFqnCBsd6RMkjVDRZzb",   # "George" — free stock voice
    model_id="eleven_multilingual_v2",
    output_format="mp3_44100_128",        # highest quality on free tier
)

output_path = Path("pitch/voiceover.mp3")
output_path.parent.mkdir(parents=True, exist_ok=True)
with open(output_path, "wb") as f:
    for chunk in audio:
        f.write(chunk)
```

## Python Snippet — stdlib only (no SDK, consistent with line_notifier.py style)

```python
import json
import os
import urllib.request
from pathlib import Path

VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # "George" — free stock voice
API_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

payload = json.dumps({
    "text": "I am not here. I have not been here for a week.",
    "model_id": "eleven_multilingual_v2",
    "output_format": "mp3_44100_128",
}).encode("utf-8")

req = urllib.request.Request(
    API_URL,
    data=payload,
    headers={
        "xi-api-key": os.environ["ELEVENLABS_API_KEY"],
        "Content-Type": "application/json",
    },
)

output_path = Path("pitch/voiceover.mp3")
output_path.parent.mkdir(parents=True, exist_ok=True)

with urllib.request.urlopen(req, timeout=30) as resp, open(output_path, "wb") as f:
    f.write(resp.read())
```

---

## Rate Limits

ElevenLabs does not publish exact req/min figures for the free tier.
Known constraints:

- **Concurrent requests:** Free tier is lowest priority queue; assume max 1–2 simultaneous
- **No burst allowance:** Unlike paid tiers, no documented burst headroom
- **Practical guidance:** For the pitch video (3–4 sequential TTS calls), add `time.sleep(2)` between calls to avoid 429s

If a 429 is returned, the response includes a `Retry-After` header — respect it.

---

## Decision for ROUNDS.ai

- Use the **stdlib snippet** (no new dependency) to stay consistent with `line_notifier.py`
- Use voice **"George"** (ID: `JBFqnCBsd6RMkjVDRZzb`) — free, English, male, clear narration style
- Generate voiceover in segments matching the pitch script sections (Section 10 of CLAUDE.md)
- Total estimated characters: ~4,000 → uses 40% of monthly free allowance
- Add `ELEVENLABS_API_KEY=your_key_here` to `.env.example` before Apr 26 build day

**Add to CLAUDE.md Section 3 Tier 3 exclusions if ElevenLabs turns out unavailable:**
fall back to developer reading the script live on camera.
