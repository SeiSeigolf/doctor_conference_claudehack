# ROUNDS.ai

Multi-agent AI system for hospital discharge planning rounds, built with Claude Opus 4.7.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Built with Claude Opus 4.7](https://img.shields.io/badge/Built%20with-Claude%20Opus%204.7-blueviolet)
![Hackathon Submission](https://img.shields.io/badge/Hackathon-Built%20with%20Opus%204.7-orange)

---

## The Absent Developer Experiment

ROUNDS.ai was built during the "Built with Opus 4.7" Claude Code Hackathon (April 21–28, 2026).
The developer (Seishiro) was largely absent throughout — checking in via LINE notifications
just three times per day, ~5 minutes each. Six Claude Code meta-agents (ARCHITECT, RESEARCHER,
BUILDER, TESTER, VALIDATOR, NARRATOR) did the rest.

The premise: if AI can build a discharge planning system while the developer is away,
it can help run discharge planning rounds when clinicians are away.
The development process is the proof of concept.

Every intervention is logged in [/logs/interventions.md](logs/interventions.md).

---

## Quick Start

> Setup instructions will be filled in on Day 5 (April 27).

---

## Architecture

Five specialized clinical agents (Physician, Nurse, Pharmacist, Social Worker, Physical Therapist)
each analyze patient data from their professional lens. An Orchestrator (Claude Opus 4.7) synthesizes
outputs, surfaces conflicts, calculates 30-day readmission risk (LACE index), and generates
handoff packages for downstream care providers.

Full system design: [CLAUDE.md](CLAUDE.md)

---

## The 3 Demo Cases

| Case | Patient | Condition | Key Finding |
|------|---------|-----------|-------------|
| 1 | Margaret Chen, 78F | CHF + pneumonia | Drug interaction + home safety conflict |
| 2 | Robert Jackson, 65M | Post-stroke hemiparesis | Clinical optimum vs patient autonomy vs insurance |
| 3 | Sarah Williams, 42F | DKA + pregnancy | Teratogenic med caught before discharge |

---

## Follow the Build

Daily agent narratives — what was built while the developer was absent:

- [Day 1 narrative](logs/narrative_day_1.md)
- [Day 2 narrative](logs/narrative_day_2.md)
- [Day 3 narrative](logs/narrative_day_3.md)
- [Day 4 narrative](logs/narrative_day_4.md)
- [Day 5 narrative](logs/narrative_day_5.md)
- [Day 6 narrative](logs/narrative_day_6.md)
