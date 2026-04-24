
# ROUNDS.ai

**Multi-Agent AI System for Hospital Discharge Planning Rounds**

Built with Claude Opus 4.7 for the "Built with Opus 4.7" Claude Code Hackathon (April 21–28, 2026).

---

## The Constitution

This file is the single source of truth for every agent, human, and automated process
working on ROUNDS.ai during this hackathon. When in doubt, return to this file.

---

## 1. Product Definition

### What ROUNDS.ai Is

ROUNDS.ai is a multi-agent AI system that prepares, orchestrates, and documents
hospital discharge planning rounds. Five specialized AI agents — Physician, Nurse,
Pharmacist, Social Worker, Physical Therapist — each analyze patient data from
their professional lens, then an Orchestrator (Claude Opus 4.7) synthesizes their
outputs, surfaces conflicts, identifies missed items, calculates 30-day readmission
risk, and generates handoff packages for downstream care providers.

### What ROUNDS.ai Is NOT

- NOT an ambient AI scribe (not competing with Abridge, Nuance DAX, Heidi).
- NOT a clinical decision support system that replaces physician judgment.
- NOT a general-purpose medical AI — it does one thing: discharge planning rounds.
- NOT a real EHR integration (for this hackathon demo, synthetic data only).
- NOT autonomous — every AI recommendation requires human approval.

### The Core Claim

> Hospitals lose billions annually on preventable 30-day readmissions.
> Discharge planning rounds take 30+ minutes per patient and still miss
> critical handoff details. ROUNDS.ai cuts prep time to 5 minutes while
> catching what human teams overlook — because AI works when humans can't.

---

## 2. Success Criteria

### Hackathon Victory Conditions (in priority order)

1. **Functional demo with 3 patient cases** (see Section 9).
   - Margaret Chen (CHF, typical success)
   - Robert Jackson (stroke, value conflict)
   - Sarah Williams (DKA + pregnancy, life-saving catch)

2. **Pitch video (5 min) following narrative in Section 10**

3. **GitHub repository public and clean**
   - Clear README
   - Reproducible setup
   - All agent prompts documented

### Non-Goals

- Real EHR integration
- HIPAA-compliant deployment
- FHIR full specification compliance
- Multi-language support
- Mobile app
- Any patient-facing features

---

## 3. Hard Constraints

### Budget

- **Total API budget: $500**
- Daily soft limits (see Section 11)
- If budget exceeds 90% before Day 6, halt all non-essential agents

### Timeline

- **Apr 22 (today, from 13:00 JST)**: Infrastructure complete + start agent prep (HUMAN + AI)
- **Apr 23**: Core agent implementation + Orchestrator + LACE scoring (AI-LED)
- **Apr 24**: UI + integration + Vercel preview (AI-LED)
- **Apr 25**: Polish, demo prep, pitch script (AI-LED)
- **Apr 26**: Pitch video recording, final README, submission prep (AI-LED)
- **Apr 27 09:00 JST**: DEADLINE — developer submits to Cerebral Valley (HUMAN, 5 min)

### Scope Tiers

**TIER 1 (MUST HAVE — BLOCKING)**
- 5 agent definitions (Physician, Nurse, Pharmacist, MSW, PT) as separate prompt modules
- Orchestrator agent using Claude Opus 4.7 xhigh
- 3 synthetic patient cases with complete clinical data
- Generate conference prep documents per patient
- Identify conflicts and missed items
- Calculate LACE index-based 30-day readmission risk score
- Generate handoff packages (PCP, Home Health, Pharmacy, Patient)
- Minimal web UI showing patient → agent outputs → orchestrator synthesis
- Full development log as proof of absent-developer build

**TIER 2 (SHOULD HAVE — EFFORT-PERMITTING)**
- Interactive UI with agent conversation visualization
- Human-in-the-loop approval flow for orchestrator recommendations
- Additional 2 patient cases (total 5)
- Comparison: ROUNDS.ai output vs baseline human team
- Evidence citations from clinical guidelines
- Cost analysis dashboard

**TIER 3 (DO NOT BUILD — FORBIDDEN FOR THIS HACKATHON)**
- VLM / image analysis (home safety photos, wound images)
- Real FHIR integration with any actual EHR
- Voice / ambient audio capture
- Geographic / regional data layers (the GAIA-Med concept)
- More than 5 agent roles
- Authentication / multi-user support
- Production security measures

---

## 4. Decision Rules (When AI Agents Are Uncertain)

When an agent hits a branching decision, apply these rules IN ORDER:

1. **If it violates patient safety → STOP and notify human via LINE.**
   Example: generating specific medication dosages without physician review.

2. **If it exceeds the $500 budget trajectory → CHOOSE THE CHEAPER OPTION.**
   Default to Sonnet 4.6 unless the task explicitly requires Opus 4.7 reasoning.

3. **If it adds scope → REJECT AND DOCUMENT.**
   Write the idea to `/logs/future_ideas.md` and move on.

4. **If it deviates from the "absent developer" narrative → REJECT.**
   We are not building the best possible product. We are building the best
   possible product that can be built while the developer is absent.

5. **If two valid technical approaches exist → PICK THE ONE WITH FEWER DEPENDENCIES.**
   Prefer standard library over frameworks. Prefer Python over Node when both work.

6. **If the agent is looping (same search/attempt 3x) → STOP and notify human via LINE.**

7. **When in doubt, PARAPHRASE THIS DOCUMENT and ask: "Would this match the constitution?"**

---

## 5. Meta-Agent Architecture

Six automated agents, each with a clear role. They communicate via shared
files in `/state/` and logs in `/logs/`.

### ARCHITECT (Opus 4.7, xhigh)
- Called at the start of each day and before major decisions.
- Reads this CLAUDE.md and the day's task brief.
- Produces the day's action plan in `/state/day_N_plan.md`.
- Reviews other agents' outputs for constitutional compliance.

### RESEARCHER (Sonnet 4.6)
- Web search, literature review, competitor analysis.
- Caps: max 20 searches per invocation, max 10 web_fetches.
- Writes findings to `/research/` with source URLs and dates.

### BUILDER (Claude Code, Opus 4.7 xhigh)
- Writes all production code.
- Works in feature branches, never directly on main.
- Must produce passing tests for every module.
- Follows code style in Section 8.

### TESTER (Sonnet 4.6)
- Writes test cases, runs tests, reports failures.
- Validates demo scenarios end-to-end daily.
- Flags any test regression to ARCHITECT.

### VALIDATOR (Opus 4.7)
- Plays each of the 5 clinical roles (Physician, Nurse, etc.) in role-play mode.
- Critiques the system from each professional perspective.
- Does NOT make up clinical data; only evaluates reasoning quality.
- Output: `/logs/validation_day_N.md`.

---

## 6. Human Intervention Protocol

The developer (Seishiro) works in active Claude Code sessions during the hackathon.
Sessions run 2–6 hours. Agents respond to developer direction in-session.

### Session Structure

- Developer opens a Claude Code session and reviews prior work.
- Directs agents via prompts in-session.
- Approves all outputs before commit.
- Commits with co-author attribution.

### Emergency Pings (LINE — when session is inactive)

Agents may ping the developer via LINE ONLY when:
- Patient safety concern arises in demo cases
- Budget hard limit hit (see Section 11)
- Agent loop detected (same action >3 times)
- Any action would violate this CLAUDE.md

### What the Developer Does

- Reviews and approves all agent outputs
- Makes all final architectural decisions
- Handles all external submissions (Cerebral Valley, Vercel, YouTube)

The developer is actively present and directing. AI agents handle implementation.

---

## 7. Technical Stack

### Models

- **Claude Opus 4.7 (xhigh)**: ARCHITECT, BUILDER for complex code, VALIDATOR, Orchestrator agent in product
- **Claude Sonnet 4.6**: RESEARCHER, TESTER, NARRATOR, 5 clinical role agents in product
- **Claude Haiku 4.5**: Batch classification, summarization, log processing

Never default to Opus xhigh for tasks Sonnet can handle. This is a budget decision, not a capability question.

### Stack

- **Language**: Python 3.12
- **Agent framework**: Direct Anthropic SDK (no LangChain, no CrewAI — reduce dependency complexity)
- **Web UI**: Next.js 14 with React, Tailwind CSS
- **Storage**: SQLite for demo (no cloud DB)
- **LINE integration**: LINE Messaging API (Seishiro has prior code to reuse)
- **Deployment**: Vercel for UI, local Python for agents
- **Version control**: Git, GitHub public repo `doctor_conference_claudehack`
- **License**: MIT

### File Layout
/
├── CLAUDE.md                 (this file — the constitution)
├── README.md                 (public-facing description)
├── LICENSE                   (MIT)
├── /agents/                  (5 clinical agents + orchestrator prompts)
│   ├── physician.md
│   ├── nurse.md
│   ├── pharmacist.md
│   ├── msw.md
│   ├── pt.md
│   └── orchestrator.md
├── /meta_agents/             (6 development automation agents)
│   ├── architect.md
│   ├── researcher.md
│   ├── builder.md
│   ├── tester.md
│   ├── validator.md
│   └── narrator.md
├── /src/                     (product code)
│   ├── agents/               (agent execution)
│   ├── orchestrator/         (synthesis logic)
│   ├── scoring/              (LACE index implementation)
│   └── handoff/              (package generators)
├── /ui/                      (Next.js frontend)
├── /cases/                   (3 synthetic patient cases)
│   ├── case1_chen.json
│   ├── case2_jackson.json
│   └── case3_williams.json
├── /research/                (RESEARCHER outputs)
├── /state/                   (daily plans, shared state)
├── /logs/                    (development logs — THE PROOF)
│   ├── sessions/
│   ├── line/
│   ├── interventions.md
│   ├── narrative_day_N.md
│   └── validation_day_N.md
├── /tests/
├── /pitch/                   (pitch video, slides, script)
└── /notifications/           (LINE webhook handler)
---

## 8. Code Style

- Type hints required in Python.
- Docstrings required on all public functions.
- No comments explaining "what" — only "why".
- Max file length: 300 lines. If exceeded, split.
- All agent prompts in separate `.md` files, loaded at runtime.
- Every commit message format: `[DAY-N] [AGENT-NAME] brief description`
  Example: `[DAY-2] [BUILDER] implement LACE index scoring`

---

## 9. Demo Scenarios

Three synthetic patient cases. The data is entirely fabricated and must not resemble any real patient. All three cases demonstrate different aspects of the product:

### Case 1: Margaret Chen, 78F
- **Teaches**: Baseline functionality
- **Condition**: CHF exacerbation + pneumonia
- **Key finding**: Drug interaction + stairs/alone conflict
- **LACE score**: 12 (HIGH risk)

### Case 2: Robert Jackson, 65M
- **Teaches**: Value conflict navigation
- **Condition**: Post-stroke, mild hemiparesis
- **Key finding**: Clinical optimum vs patient autonomy vs insurance reality
- **LACE score**: 10 (MODERATE-HIGH)

### Case 3: Sarah Williams, 42F
- **Teaches**: Life-saving catch
- **Condition**: DKA + newly discovered pregnancy
- **Key finding**: Teratogenic med ordered, insurance gap, compounded SDOH
- **LACE score**: 13 (HIGHEST)

Full case JSON files in `/cases/` must be generated on Day 1 by RESEARCHER working with ARCHITECT.

---

## 10. Pitch Narrative (Immutable Core)

Full script in `/pitch/narrative.md`. Summary of required structure:

1. **Opening (45 sec)**: Five professionals meet to plan discharge. They each prepare alone.
   They each miss something. Medicare penalizes hospitals $26 billion annually.

2. **Solution (60 sec)**: Five AI agents thinking like five specialists. Orchestrator on
   Claude Opus 4.7 synthesizes, surfaces conflicts, calculates LACE-based 30-day risk.

3. **Demo (150 sec)**: All 3 patient cases end-to-end.
   - Case 1 (Chen): baseline coordination
   - Case 2 (Jackson): value conflict navigation
   - Case 3 (Williams): life-saving catch — teratogenic drug order (emotional peak)

4. **Technical (30 sec)**: Opus 4.7 orchestrator, Sonnet 4.6 agents, direct Anthropic SDK,
   Python + Next.js, Vercel.

5. **Closing (15 sec)**: "I'm a second-year medical student. I built this because I've
   watched discharge rounds fail. ROUNDS.ai doesn't replace clinicians.
   It lets them finally see each other."

Total: 5 minutes. Do not deviate. Other ideas → `/pitch/bonus_ideas.md`.

---

## 11. Budget Enforcement

Daily soft limits ($500 total / 5 days):

| Date | Soft Limit | Hard Limit |
|------|-----------|------------|
| Apr 22 (remaining) | $30 | $50 |
| Apr 23 | $110 | $140 |
| Apr 24 | $140 | $170 |
| Apr 25 | $110 | $140 |
| Apr 26 | $80 | $110 |
| Reserve | — | $30 |

If hard limit hit: ping developer via LINE, halt all non-essential agents until GO received.

Track via `/logs/budget.md` updated after every API call.

---

## 12. Forbidden Behaviors

No agent, no human, under any circumstance, may:

1. Use real patient data. Everything is synthetic.
2. Generate content that could be mistaken for real medical advice.
3. Disable or bypass the LINE notification system.
4. Modify this CLAUDE.md without the developer's explicit approval.
5. Claim the system is HIPAA-compliant, FDA-cleared, or production-ready.
6. Add scope listed in Tier 3 (Section 3).
7. Continue past a hard budget limit without human approval.
8. Echo, print, or log API keys, tokens, secrets, or credentials in terminal output, command arguments, commit messages, file contents committed to git, or any medium the developer could inadvertently share. Always use interactive prompts or stdin redirection from files.

---

## 13. Changelog

All modifications to this CLAUDE.md must be logged here with justification.

- **2026-04-22**: Initial constitution. (Seishiro + Claude)
- **2026-04-22 13:00 JST**: Timeline compressed to 5 days; budget redistributed; added Section 14 submission checklist. (Seishiro + Claude)
- **2026-04-23 16:00 JST**: Major pivot. Withdrew absent-developer narrative. Competing on product quality alone. Simplified meta-agent structure (removed NARRATOR). Rewrote Sections 1, 2, 6, 10, 12. New positioning: multi-agent medicine for discharge planning. (Seishiro + Claude)
- **2026-04-24**: Rotated leaked API key; added Section 12 item 8 — credential handling policy prohibiting logging/echoing secrets. (Seishiro + Claude)

---

## 14. Hackathon Submission Checklist

Four deliverables required for a complete submission. Track status here.

1. **Public GitHub repository** (this repo)
   - All source code, agent prompts, case data, logs, and pitch materials
   - Must be public before deadline

2. **Demo video on YouTube** (5–7 min)
   - Follows CLAUDE.md Section 10 pitch narrative exactly
   - Upload unlisted or public before 2026-04-27 08:00 JST
   - Link must appear at top of README.md

3. **Live deployment on Vercel**
   - Next.js UI deployed to Vercel free tier
   - Must be publicly accessible
   - Link must appear at top of README.md

4. **Cerebral Valley submission form** ← HUMAN ACTION REQUIRED
   - Project name: "ROUNDS.ai"
   - Description: 1–2 sentences
   - GitHub URL, YouTube URL, Vercel URL
   - Agents prepare ready-to-paste text in `/pitch/submission.md`
   - Developer submits manually before 2026-04-27 09:00 JST

---

*End of constitution. When agents are lost, they return here.*
