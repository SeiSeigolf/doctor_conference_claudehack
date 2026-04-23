# MASTER BRIEF — ROUNDS.ai Hackathon Completion

**For Claude Code agents working in active sessions with the developer.**

This is your top-level mission. Follow CLAUDE.md for constitutional rules.
This file tells you WHAT to deliver. CLAUDE.md tells you HOW to behave.

---

## The Deadline

**2026-04-27 09:00 JST** (April 26, 20:00 EDT)

All deliverables must be complete and submitted before this time.

---

## Required Deliverables

### 1. Public GitHub Repository (THIS REPO)

Must contain at final submission:

- [x] `CLAUDE.md` (constitution) — done
- [x] `LICENSE` (MIT) — done
- [ ] `README.md` — polished, following winner template (see "README Template" below)
- [ ] `DEMO.md` — step-by-step demo instructions with screenshots
- [ ] `PROGRESS.md` — build log by day
- [ ] `/src/` — working Python code for all 5 clinical agents + Orchestrator
- [ ] `/ui/` — working web interface (Next.js)
- [ ] `/cases/case1_chen.json`, `case2_jackson.json`, `case3_williams.json` — synthetic patient data
- [ ] `/tests/` — passing test suite covering agents, LACE scoring, handoff generation
- [ ] `/agents/` — all 6 prompt files (physician, nurse, pharmacist, msw, pt, orchestrator)
- [ ] `/pitch/narrative.md` — pitch script — done
- [ ] `/pitch/storyboard.md` — shot-by-shot video plan

### 2. Demo Video (YouTube, public or unlisted)

- Length: 5 minutes (see `/pitch/narrative.md` for exact structure)
- Include: problem stats, 3 demo cases, technical stack
- Upload before 2026-04-27 08:00 JST
- Link goes into README.md top

### 3. Live Deployment (Vercel)

- Deploy the Next.js UI to Vercel free tier
- Must be publicly accessible
- Link goes into README.md top

### 4. Cerebral Valley Submission

- Required: Project name "ROUNDS.ai", 1-2 sentence description, GitHub URL, YouTube URL, Live URL
- **HUMAN ACTION REQUIRED** — developer submits manually before 09:00 JST 2026-04-27
- Agents prepare ready-to-paste text in `/pitch/submission.md` before Apr 26 end-of-day

---

## README Template (Final)

The final README.md must follow this structure:

````markdown
# ROUNDS.ai

### Built with Claude Opus 4.7 — Submission for the "Built with Opus 4.7" Claude Code Hackathon

[🎥 Demo Video](YOUTUBE_URL) · [🌐 Live Demo](VERCEL_URL) · [📋 CLAUDE.md](./CLAUDE.md)

**Multi-agent AI system for hospital discharge planning rounds.**

## The Problem

Every week in US hospitals, five professionals meet to plan one patient's discharge.
They each prepare alone. They each speak in turn. And they each miss something.

Medicare penalizes hospitals $26 billion annually for preventable readmissions.
Most of that is avoidable — if the team could see each other's work before the
meeting even started.

## What ROUNDS.ai Does

ROUNDS.ai orchestrates five specialized AI agents — Physician, Nurse, Pharmacist,
Social Worker, Physical Therapist — each analyzing the same patient from their
professional perspective. An Orchestrator (Claude Opus 4.7) synthesizes their
outputs, surfaces conflicts and gaps, calculates LACE-based 30-day readmission
risk, and generates handoff packages for downstream care providers.

Before the meeting starts, the discharge plan is already drafted — and the gaps
are already flagged.

## The Developer

Seishiro Funaoka is a second-year medical student at Kochi University and
co-founder of SOTTO, a healthcare data infrastructure startup focused on regional
medical coordination in Japan. ROUNDS.ai reflects that work: the gap between
what multi-professional teams know and what they actually share before a
discharge decision is made.

## How It Works

[Architecture diagram here]

````
Patient Data (synthetic FHIR-style JSON)
    ↓
5 Clinical Agents (parallel, Claude Sonnet 4.6)
    ├── Physician Agent
    ├── Nurse Agent
    ├── Pharmacist Agent
    ├── MSW Agent
    └── PT Agent
    ↓
Orchestrator (Claude Opus 4.7 xhigh)
    ↓
Output:
    • Conference Prep Document
    • Conflicts & Missed Items
    • LACE 30-Day Readmission Score
    • Handoff Packages (PCP, Home Health, Pharmacy, Patient)
````

## Demo Cases

| Case | Patient | Teaches |
|------|---------|---------|
| 1 | Margaret Chen, 78F, CHF + pneumonia | Baseline multi-agent coordination |
| 2 | Robert Jackson, 65M, post-stroke | Value conflict navigation |
| 3 | Sarah Williams, 42F, DKA + pregnancy | Life-saving catch — teratogenic drug + insurance gap |

## Tech Stack

| Layer | Tech |
|-------|------|
| AI Models | Claude Opus 4.7 (xhigh), Claude Sonnet 4.6 |
| Agent Framework | Direct Anthropic SDK |
| Language | Python 3.12 |
| Frontend | Next.js 14, Tailwind CSS |
| Storage | SQLite |
| Notifications | LINE Messaging API |
| Deployment | Vercel |
| Dev Tool | Claude Code |

## Running Locally

See [DEMO.md](./DEMO.md) for full instructions.

```bash
git clone https://github.com/SeiSeigolf/doctor_conference_claudehack
cd doctor_conference_claudehack
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your Anthropic API key
python src/main.py --case 1
```

## Data Attribution

All patient data is entirely synthetic and fabricated for demonstration
purposes only. No real patient information was used or referenced.
LACE index methodology sourced from van Walraven et al. (2010), CMAJ.

## License

MIT — see [LICENSE](./LICENSE)

---

Built with Claude Opus 4.7 and Claude Code.
````

---

## Execution Plan by Day (revised 2026-04-23)

### Apr 23 (TODAY — remaining hours)

Focus: catch-up session 16:00–19:00 JST
- 3 synthetic patient case JSON files
- 5 clinical agent system prompts
- See `/state/day_plan_2026-04-23.md`

### Apr 24

Focus: Core agent implementation
- Python module for each clinical agent (`/src/agents/`)
- Orchestrator synthesis logic (`/src/orchestrator/`)
- LACE index calculator (`/src/scoring/`)
- Basic CLI runner (`python src/main.py --case N`)
- Tests for all above (`/tests/`)
- Orchestrator prompt (`/agents/orchestrator.md`)

### Apr 25

Focus: UI + integration
- Next.js frontend: patient → 5 agent outputs → orchestrator synthesis
- Conflict table and handoff package display
- All 3 cases runnable from UI
- Vercel preview deploy

### Apr 26

Focus: Polish + pitch
- DEMO.md with screenshots
- Final README with video + Vercel links
- PROGRESS.md build log
- Pitch storyboard (`/pitch/storyboard.md`)
- Screen recording of demo
- Upload to YouTube
- Prepare `/pitch/submission.md` with ready-to-paste Cerebral Valley text

### Apr 27 09:00 JST — DEADLINE

**HUMAN ACTION:** Developer logs into Cerebral Valley, pastes from `/pitch/submission.md`, submits.

---

## Budget (revised)

Total: $500. Remaining after Apr 22–23: ~$470.

| Date | Soft Limit | Hard Limit |
|------|-----------|------------|
| Apr 23 (remaining) | $10 | $20 |
| Apr 24 | $140 | $170 |
| Apr 25 | $140 | $170 |
| Apr 26 | $110 | $140 |
| Reserve | — | $30 |

---

## When Agents Are Confused

1. Check CLAUDE.md Section 4 (Decision Rules)
2. Check this MASTER_BRIEF.md
3. If still unclear, ask developer in-session or LINE with priority="checkpoint"
4. NEVER make up medical facts, clinical guidelines, or reference data
5. NEVER claim the system is HIPAA-compliant or FDA-cleared

---

*End of master brief. Now build.*
