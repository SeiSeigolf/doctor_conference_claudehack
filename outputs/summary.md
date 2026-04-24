# ROUNDS.ai — Backend Validation Summary

**Generated:** 2026-04-23
**Pipeline:** 5 clinical agents (claude-sonnet-4-6) → Orchestrator (claude-opus-4-5)
**Status:** All 3 cases ran end-to-end successfully

---

## Case Comparison

| | Case 1: Margaret Chen | Case 2: Robert Jackson | Case 3: Sarah Williams |
|---|---|---|---|
| **Age / Sex** | 78F | 65M | 42F |
| **Primary Dx** | CHF + pneumonia | Post-stroke, hemiparesis | DKA + 7wk pregnancy |
| **LACE** | 12 [HIGH] | 10 [HIGH] | 13 [VERY HIGH] |
| **Readiness** | NOT READY | NOT READY | NOT READY |
| **Conflicts** | 4 | 3 | 4 |
| **Gaps** | 11 | 7 | 8 |
| **Actions** | 20 | 24 | 21 |
| **Agents missing** | None | None | None |
| **Confidence** | Moderate | Moderate | High |

---

## Primary Conflicts by Case

### Case 1 — Margaret Chen
1. **[CRITICAL]** Patient wants home → PT says she cannot climb 3 flights of stairs with current mobility
2. **[CRITICAL]** Furosemide discharge dose undecided — inpatient dose is 4× home dose in now-euvolemic patient with CKD
3. **[CRITICAL]** No anticoagulation for Afib with CHA₂DS₂-VASc ≥5 — aspirin alone is inadequate
4. KCl dose dependent on BMP not yet resulted

### Case 2 — Robert Jackson
1. **[CRITICAL]** Three-way conflict: PT/physician recommend IRF → patient refuses ("I'm not going to a nursing home") → insurance caps outpatient PT at 20 visits/year
2. **[CRITICAL]** Driving restriction not yet communicated to patient who drove independently before stroke
3. Atorvastatin 80mg + Amlodipine CYP3A4 interaction — elevated myopathy risk

### Case 3 — Sarah Williams
1. **[CRITICAL]** Lisinopril and atorvastatin — both teratogenic, both still on active orders at Day 5 despite pregnancy confirmed Day 2
2. **[CRITICAL]** Insulin access gap — $600–700/month, patient is uninsured with Medicaid pending
3. **[CRITICAL]** MFM vs standard OB — T1DM + HbA1c 11.4% in first trimester requires specialist, not community OB
4. Occupation conflict — bicycle courier and hypoglycemia risk on adjusted insulin regimen

---

## Critical Actions by Case

### Case 1 (5 critical)
- Address anticoagulation gap (Physician)
- Complete PT stair-climb assessment (PT)
- Order stat BMP (Physician)
- Finalize furosemide discharge dose (Physician)
- Finalize KCl dose in tandem (Physician/Pharmacist)

### Case 2 (4 critical)
- Complete goals-of-care conversation re IRF refusal, document informed refusal (Physician/MSW/PT)
- Communicate and document driving restriction to patient and wife (Physician/Nurse)
- Teach-back on Clopidogrel stop date May 6, 2026 with written calendar (Nurse/Pharmacist)
- Counsel patient explicitly: no NSAIDs during DAPT course (Pharmacist/Nurse)

### Case 3 (5 critical)
- Discontinue lisinopril 10mg immediately (Physician)
- Discontinue atorvastatin 20mg immediately (Physician)
- Order pregnancy-safe antihypertensive to replace lisinopril (Physician)
- Confirm insulin access with verified dispensing plan (MSW/Pharmacist)
- Place MFM referral with confirmed appointment within 7 days (MSW/Care Coordinator)

---

## Notable Gaps Caught (not in original case brief)

### Case 1
- No anticoagulation for Afib — caught only by Pharmacist agent, not physician
- No glucagon kit (lives alone, on insulin)
- Medicare Part D coverage not verified — Medigap alone doesn't cover prescriptions
- Daughter availability on discharge day unconfirmed
- No medical alert device in place

### Case 2
- Driving restriction not formally communicated (cross-role gap — PT noted mobility, Physician noted neuro, neither owned communication)
- Home health PT eligibility under Medicare Advantage home health benefit not assessed
- Baseline CK/LFTs not obtained before high-intensity statin initiation
- No formal balance score (only "high risk" proxy)

### Case 3
- Glucagon kit not prescribed (lives alone, T1DM, adjusted dosing)
- CGM not ordered or discussed (strongly indicated for T1DM in pregnancy)
- Domestic safety/IPV screen not done (recent partner separation, circumstances unknown)
- No teach-back documented for any education domain
- New antihypertensive not yet ordered despite lisinopril identified for discontinuation

---

## Clinical Quality Assessment

### Strengths
- All 3 orchestrator outputs independently reproduced the "signature" finding of each case (stairs, IRF refusal, teratogenic meds) without being prompted
- Cross-role gaps (items no single agent owned) were consistently caught
- Pharmacist agent performance was strongest: caught Afib anticoagulation gap in Case 1, CYP3A4 interaction in Case 2, full insulin access map in Case 3
- Patient instructions are appropriate reading level in all 3 cases; no medical jargon
- Conference agendas are decision-oriented and time-allocated

### Issues Found and Fixed
- `max_tokens` for clinical agents was 4096 → truncating JSON responses → raised to 8192
- `max_tokens` for orchestrator was 8192 → truncating → raised to 16384
- `meta.model` and `synthesis_timestamp` were hallucinated by model → now injected by synthesizer.py post-response

### Remaining Concerns
- **All 3 cases return `not_ready`** — clinically correct for these cases (all have blocking pre-discharge actions), but UI will never show a "green" discharge. Consider adding a fourth case or adding a "conditional" case for demo variety.
- **Action count is high** (20–24 per case) — all actions are legitimate but UI should allow collapsing lower-priority items by default
- Case 3 patient instructions contain `[methyldopa/labetalol/nifedipine]` placeholder — correct behavior (drug not yet ordered), but should be visually flagged in UI
- Case 1 conference agenda totals 15min exactly; Case 2 and 3 need time allocation review

---

## Demo Recommendation

**Lead with Case 3 (Sarah Williams) as the emotional peak.**

Case 3 is the strongest demo because:
1. The teratogenic drug catch is visceral and immediate — audience understands the stakes without medical knowledge
2. LACE 13 (VERY HIGH) makes the risk concrete
3. The SDOH compounding (uninsured, unstable housing, food insecurity, no prenatal care) makes the "why ROUNDS.ai exists" argument complete
4. The gap between "doctor says clinically ready" and "orchestrator says NOT READY" is the clearest demonstration of multi-agent synthesis value

Order for pitch: Case 1 (baseline) → Case 2 (value conflict) → Case 3 (life-saving catch).
Case 3 is where you pause after the teratogen reveal.

---

*Backend stabilization complete. Ready for UI implementation (Day 3).*
