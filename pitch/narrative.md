# ROUNDS.ai — Pitch Narrative (Immutable Core)

**Title:** ROUNDS.ai: Multi-Agent Medicine for Discharge Planning
**Total runtime:** 5 minutes
**Last updated:** 2026-04-23

---

## Opening (45 sec)

"Every week in US hospitals, five professionals meet to plan one patient's discharge.
Nurse, pharmacist, social worker, physical therapist, physician.
They each prepare alone. They each speak in turn. And they each miss something.

Medicare penalizes hospitals $26 billion annually for preventable readmissions.
Most of that is avoidable — if the team could see each other's work
before the meeting even started."

---

## Solution (60 sec)

"ROUNDS.ai is five AI agents that think like five specialists.
Each analyzes the same patient from their professional lens.
An orchestrator, built on Claude Opus 4.7, synthesizes their outputs,
surfaces conflicts, and calculates 30-day readmission risk using
the validated LACE index.
Before the meeting starts, the discharge plan is already drafted —
and the gaps are already flagged."

---

## Demo (150 sec)

Walk through all three cases end-to-end in the UI.

### Case 1 — Margaret Chen, 78F (CHF + pneumonia)
**Teaches:** Baseline multi-agent coordination
- Show 5 agents analyzing in parallel
- Show orchestrator synthesis with conflict table
- Show LACE score (12 — HIGH) and handoff packages

### Case 2 — Robert Jackson, 65M (post-stroke, mild hemiparesis)
**Teaches:** Value conflict navigation
- PT recommends inpatient rehab
- Patient refuses, wants home
- Insurance covers only 20 PT visits/year
- Show orchestrator surfacing the three-way conflict with resolution options
- LACE score: 10 (MODERATE-HIGH)

### Case 3 — Sarah Williams, 42F (DKA + newly confirmed pregnancy)
**Teaches:** Life-saving catch
- Teratogenic medication in active orders not yet discontinued
- No prenatal care established
- Insurance gap for insulin post-discharge
- Show orchestrator flagging teratogen before discharge — the emotional peak
- LACE score: 13 (HIGHEST)

---

## Technical (30 sec)

"Built on Claude Opus 4.7 xhigh for the orchestrator and Claude Sonnet 4.6
for each specialist agent. Direct Anthropic SDK — no framework overhead.
Python backend, Next.js frontend, deployed on Vercel."

---

## Closing (15 sec)

"I'm a second-year medical student.
I built this because I've watched discharge rounds fail.
ROUNDS.ai doesn't replace clinicians.
It lets them finally see each other."

---

## Notes for Recording

- Case 3 is the emotional peak — pause after the teratogen reveal, let it land.
- "See each other" is the closing image — hold on it.
- Do not exceed 5 minutes. Cut from demo if needed, not from opening or closing.
- Other ideas → `/pitch/bonus_ideas.md`. Do not add to this script.

---

## Production Notes

- All narration will be AI-generated (ElevenLabs free tier, voice "George" — JBFqnCBsd6RMkjVDRZzb)
- On-screen: split between (a) product UI walkthrough and (b) architecture diagrams
- Case 3 (Sarah Williams) is the emotional peak — linger there 5–10 seconds longer on the teratogenic drug catch
- No talking-head shots of the developer — the product speaks
- Background music: royalty-free, soft instrumental, low volume (e.g., from pixabay.com/music)
- Target: 5:00 duration, acceptable range 4:30–5:30
- Export: 1080p MP4, H.264, under 500MB
