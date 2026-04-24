# Case 1: Margaret Chen — Discharge Planning Synthesis

**Case ID:** CASE-001  
**Discharge Readiness:** NOT_READY  
**Rationale:** Physician agent has marked discharge_ready: false pending two critical conditions — PT stair-climb assessment and repeat BMP — neither of which has been completed; additionally, the Pharmacist agent has identified a critical anticoagulation gap in a high-risk Afib patient that must be addressed before discharge.

## LACE Score: 12 [HIGH]
Approximately 25–30% 30-day readmission risk. All bridge supports must be confirmed in place before discharge: Home Health nursing and PT activated with first visit within 24–48 hours, PCP follow-up at 3 days, BMP at 2–3 days, cardiology at 1 week, daughter present for discharge teaching, written instructions at appropriate literacy level, and daily weight monitoring protocol established.

## Conflicts
### C1: Patient preference for home discharge vs. functional inability to access third-floor walkup apartment
**Urgency:** before_discharge  
**Requires physician decision:** True

**Positions:**
- *Patient*: Prefers discharge to home
- *PT Agent*: Patient cannot safely navigate 3 flights of stairs; current ambulation limited to 15 feet with walker before rest
- *Nurse Agent*: ADL assessment indicates patient is not safe for discharge to current home setting without stair clearance
- *MSW Agent*: Housing is an active discharge safety barrier; SNF contingency must be activated in parallel

**Resolution options:**
- PT completes in-hospital stair assessment today; if patient demonstrates safe stair negotiation with supervision, proceed with home discharge with daughter present and Home Health activated — *Trade-off: Delays discharge by hours to 1 day; preserves patient autonomy if successful*
- Discharge to short-term SNF for PT rehabilitation and functional recovery, then transition home when stair-safe — *Trade-off: Patient preference not honored immediately; adds facility transition; preserves safety; Medicare SNF benefit available (4-day qualifying stay met)*
- Temporary discharge to daughter's home if single-story or accessible, with Home Health redirected to that address — *Trade-off: Requires daughter to take time off work; requires verification of daughter's home accessibility; logistically complex*

### C2: Discharge furosemide dose undetermined — inpatient dose (40 mg BID) is 4x home dose (20 mg daily) in a now-euvolemic patient with CKD 3a
**Urgency:** before_discharge  
**Requires physician decision:** True

**Positions:**
- *Physician Agent*: Discharge dose not finalized; continuing inpatient dose risks over-diuresis and AKI
- *Pharmacist Agent*: Critical flag — do not discharge on default inpatient dose without explicit prescriber intent; euvolemic status requires dose reduction
- *Nurse Agent*: Cannot complete medication education until furosemide dose is confirmed

**Resolution options:**
- Return to home dose (20 mg daily) given euvolemic status, with cardiology follow-up at 1 week to uptitrate if needed — *Trade-off: Risk of re-accumulation if heart failure compensation is marginal; conservative approach*
- Discharge on intermediate dose (40 mg daily) with weight-based home monitoring and clear re-escalation instructions — *Trade-off: Balances diuresis maintenance with AKI risk; requires robust home monitoring*
- Discharge on 40 mg BID with mandatory BMP at 2–3 days and explicit creatinine-based hold parameters — *Trade-off: Highest diuresis intensity; highest AKI risk; requires tight monitoring and patient/family understanding of hold parameters*

### C3: Potassium chloride discharge dose dependent on BMP not yet resulted and on furosemide dose decision
**Urgency:** before_discharge  
**Requires physician decision:** True

**Positions:**
- *Physician Agent*: Discharge KCl dose cannot be finalized until repeat BMP confirms K+ stability
- *Pharmacist Agent*: Current 20 mEq BID may cause hyperkalemia once furosemide is down-titrated and spironolactone effect matures; dose must be reassessed

**Resolution options:**
- Order BMP today; once K+ results, adjust KCl dose in tandem with furosemide decision — *Trade-off: Delays discharge by hours; ensures electrolyte safety*
- Discharge on reduced KCl dose (e.g., 10 mEq daily or 20 mEq daily) with mandatory 2–3 day BMP recheck and explicit discontinuation if K+ >5.0 — *Trade-off: Empiric reduction without lab confirmation; requires patient/family understanding of hold parameters*

### C4: No anticoagulation prescribed for chronic atrial fibrillation with CHA2DS2-VASc ≥5 — aspirin alone is inadequate
**Urgency:** before_discharge  
**Requires physician decision:** True

**Positions:**
- *Pharmacist Agent*: Critical safety flag — anticoagulation omission must be addressed; aspirin is not guideline-adequate stroke prevention at this risk level
- *Physician Agent*: Anticoagulation gap identified; absence requires explicit documentation of contraindication or initiation of DOAC

**Resolution options:**
- Initiate DOAC (e.g., apixaban 5 mg BID, reduced dose 2.5 mg BID if meeting 2 of 3 criteria: age ≥80, weight ≤60 kg, Cr ≥1.5) before discharge — *Trade-off: Adds bleeding risk in a fall-risk patient; guideline-concordant stroke prevention; requires patient education*
- Document explicit contraindication (e.g., HAS-BLED assessment, prior major hemorrhage, patient refusal) and defer to cardiology at 1-week follow-up — *Trade-off: Leaves patient at elevated stroke risk during high-vulnerability post-discharge window; defers decision but documents rationale*
- Refer decision to cardiology for same-day phone or in-person consultation before discharge — *Trade-off: May delay discharge; ensures specialist input on risk-benefit in complex patient*

## Gaps
### G1: No formal PT evaluation has been documented — all functional data is from nursing notes; bedside PT assessment has not occurred
**Owner:** PT / Physician  
**Urgency:** before_discharge  
**Action:** Order and complete formal PT evaluation including stair assessment before discharge decision

### G2: Repeat BMP not yet ordered or resulted — electrolyte and renal function confirmation is required before medication doses can be finalized
**Owner:** Physician  
**Urgency:** before_discharge  
**Action:** Order stat BMP; result must be available before discharge order is written

### G3: Medicare Part D coverage not documented — Medigap alone does not cover outpatient prescriptions; if no Part D plan, all discharge medications are out-of-pocket
**Owner:** MSW / Pharmacy  
**Urgency:** before_discharge  
**Action:** Verify Part D plan status; if absent, establish cost-access bridge for spironolactone, insulin, and antibiotic before patient leaves

### G4: Daughter (Alice Chen) availability on discharge day is unconfirmed — she must be present for medication teaching given patient's cognitive impairment and regimen complexity
**Owner:** MSW / Nurse  
**Urgency:** before_discharge  
**Action:** Contact Alice Chen today to confirm discharge day availability; if unavailable, delay discharge or arrange video teaching with documented follow-up

### G5: Teach-back documentation absent for all discharge education domains — education completion status is unknown
**Owner:** Nurse  
**Urgency:** before_discharge  
**Action:** Nurse to initiate and document formal teach-back sessions covering daily weight, new medications, warning signs, and insulin administration before discharge

### G6: Home safety assessment not completed — bathroom configuration, grab bar placement, stair rail adequacy in building not verified
**Owner:** PT / OT / MSW  
**Urgency:** within_48h  
**Action:** Order OT home safety evaluation; if not possible before discharge, PT/OT must assess on first home visit; DME (shower chair, grab bars) should be ordered before discharge

### G7: No medical alert device in place — patient lives alone, high fall risk, mild cognitive impairment, limited weekday support
**Owner:** MSW / Care Coordinator  
**Urgency:** before_discharge  
**Action:** Order personal emergency response system; confirm device is in patient's possession or will be delivered day of discharge

### G8: RIDE paratransit application not initiated — patient lacks personal vehicle and daughter has limited availability, but 3-day PCP and 2–3 day lab appointments require reliable transport
**Owner:** MSW  
**Urgency:** before_discharge  
**Action:** Initiate RIDE application today; coordinate with daughter for first post-discharge appointment as bridge

### G9: Amoxicillin-clavulanate remaining doses not confirmed dispensed or in-hand — antibiotic course completes 2 days post-discharge
**Owner:** Pharmacy / Nurse  
**Urgency:** before_discharge  
**Action:** Verify prescription is filled or dispensed before patient leaves building; do not assume it will be filled at outside pharmacy

### G10: Insulin glargine injection technique and education not verified this admission — patient uses at home but no documented reassessment
**Owner:** Nurse  
**Urgency:** before_discharge  
**Action:** Nurse to observe and document insulin self-administration teach-back before discharge

### G11: Daily telephone reassurance / check-in program not yet referred — patient lives alone with mild cognitive impairment and high fall risk
**Owner:** MSW  
**Urgency:** before_discharge  
**Action:** Refer to daily check-in program (e.g., Boston Aging Concerns Center or equivalent) before discharge

## Prioritized Actions
1. [CRITICAL] **Physician** — Physician to address anticoagulation gap: document explicit contraindication for absence of anticoagulation OR initiate DOAC (e.g., apixaban with renal dosing) for chronic Afib with CHA2DS2-VASc ≥5
   *Urgency: before discharge* | Patient has ~6–8% annual stroke risk on aspirin alone; post-discharge period is high-vulnerability; omission without documentation is a patient safety gap

2. [CRITICAL] **PT** — Order and complete formal PT evaluation including supervised stair-climb assessment; document clearance or inability to safely navigate 3 flights
   *Urgency: before discharge* | Patient cannot safely reach her apartment at current functional status; discharging without stair clearance creates immediate fall and readmission risk

3. [CRITICAL] **Physician** — Order stat BMP; result must be reviewed before discharge order is written; potassium and creatinine required to finalize furosemide and KCl doses
   *Urgency: before discharge* | Triple-therapy regimen (lisinopril + spironolactone + furosemide) with CKD 3a creates unpredictable electrolyte and renal risk; cannot finalize medication doses without current labs

4. [CRITICAL] **Physician** — Physician to finalize discharge furosemide dose based on BMP results and euvolemic status; do not discharge on default inpatient 40 mg BID dose without explicit intent
   *Urgency: before discharge* | Continuing 4x home dose in euvolemic CKD patient risks AKI and readmission for acute kidney injury or volume depletion

5. [CRITICAL] **Physician** — Finalize KCl discharge dose in tandem with furosemide decision; likely requires reduction from 20 mEq BID given spironolactone initiation
   *Urgency: before discharge* | Hyperkalemia triad (ACE + aldosterone antagonist + KCl) in CKD 3a patient; continued aggressive supplementation risks life-threatening hyperkalemia post-discharge

6. [HIGH] **MSW / Nurse** — Contact daughter Alice Chen today to confirm availability on discharge day for medication teaching; if unavailable, delay discharge or arrange video teaching with documented follow-up
   *Urgency: before discharge* | Patient has mild cognitive impairment and 9-medication complex regimen with 2 new drugs and 2 dose changes; teaching to patient alone is insufficient

7. [HIGH] **MSW / Pharmacy** — Verify Medicare Part D plan status; confirm all discharge medications are on formulary; if no Part D, establish cost-access bridge (GoodRx, manufacturer assistance) for spironolactone, insulin, and antibiotic
   *Urgency: before discharge* | Medigap alone does not cover outpatient drugs; patient may be unable to fill prescriptions at pharmacy if coverage gap exists

8. [HIGH] **Pharmacy / Nurse** — Confirm amoxicillin-clavulanate remaining doses (2 days, 4 doses) are dispensed or filled before patient leaves building
   *Urgency: before discharge* | Antibiotic course incomplete at discharge; incomplete treatment risks treatment failure and pneumonia recurrence/readmission

9. [HIGH] **Nurse** — Nurse to complete and document teach-back for all high-priority topics: daily weight thresholds, new medications (spironolactone, KCl), warning signs, insulin administration, antibiotic completion
   *Urgency: before discharge* | No teach-back documentation exists; patient understanding is unverified; LACE 12 requires confirmed patient and caregiver comprehension

10. [HIGH] **Care Coordinator / MSW** — Submit Home Health referral to Medicare-certified agency; confirm first nursing visit within 24–48 hours and first PT visit within 48–72 hours; document homebound status justification
   *Urgency: before discharge* | LACE 12 patient with complex medications, functional decline, and social isolation requires structured monitoring; Home Health is the primary safety net

11. [HIGH] **PT / Care Coordinator** — Order DME before discharge: shower chair, grab bars for tub/shower area, non-slip bath mat, handheld shower head, medical alert device
   *Urgency: before discharge* | Patient has new bathing assist need, high fall risk (Morse 65), lives alone; bathroom is highest in-home fall risk location

12. [HIGH] **Care Coordinator** — Confirm PCP appointment at 3 days post-discharge and cardiology at 1 week are scheduled; provide written appointment confirmation to patient and daughter
   *Urgency: before discharge* | LACE 12 requires confirmed follow-up within tight timeframes; deferred appointments increase readmission risk

13. [HIGH] **Physician / Care Coordinator** — Ensure outpatient BMP lab order is in patient's hand for 2–3 day post-discharge draw; confirm lab location and daughter transport availability
   *Urgency: before discharge* | Post-discharge electrolyte monitoring is mandatory given triple-therapy and CKD; missed lab = undetected hyperkalemia or AKI

14. [MODERATE] **MSW** — Initiate MBTA RIDE paratransit application; coordinate with daughter to cover first post-discharge appointment if RIDE not yet active
   *Urgency: before discharge* | Patient has 3 appointments in first week post-discharge; daughter can drive 2x/week; transport gap risks missed follow-up

15. [MODERATE] **MSW** — Refer patient to daily telephone reassurance / check-in program for post-discharge period
   *Urgency: before discharge* | Patient lives alone with mild cognitive impairment; daily touchpoint allows early detection of decompensation between Home Health visits

16. [MODERATE] **MSW** — Confirm Meals on Wheels is notified of discharge date and will resume delivery; if SNF, notify to pause service
   *Urgency: before discharge* | Patient relies on this service for nutrition and daily contact; gap in service compromises both

17. [MODERATE] **Nurse** — Nurse to observe and document insulin glargine self-administration technique and site rotation education
   *Urgency: before discharge* | Injection technique not verified this admission; patient is 78 with functional decline; lipohypertrophy or technique errors risk glycemic instability

18. [MODERATE] **MSW** — If PT stair assessment fails, immediately activate SNF placement process — do not wait; initiate referral packet and identify Medicare-accepting facilities in patient's preferred area
   *Urgency: same day post-discharge* | SNF bed placement takes time; parallel planning prevents discharge delay if home is not viable

19. [LOW] **Physician** — Flag HbA1c 7.8% and suboptimal glycemic control for PCP at 3-day follow-up; insulin adjustment or addition of oral agent may be warranted
   *Urgency: within 1 week* | Above target diabetes control; not a discharge-blocking issue but requires outpatient optimization

20. [LOW] **Physician** — Flag normocytic anemia (Hgb 10.8) for PCP workup if not previously evaluated
   *Urgency: within 1 week* | Contributes to fatigue and fall risk; warrants outpatient investigation but not acute intervention

## Patient Instructions
Dear Mrs. Chen,

You were in the hospital because your heart was holding too much fluid and you also had an infection in your lungs (pneumonia). You are doing much better now.

**Your Medicines Changed:**
- You have a NEW pill called spironolactone. It helps your heart. It can raise potassium in your blood, so you MUST get a blood test in 2–3 days. Avoid salt substitutes.
- Your water pill (furosemide) dose may be different from what you had at home. Check the bottle carefully. Do not take your old pills — use only the new prescription.
- Finish your antibiotic (amoxicillin-clavulanate) through Thursday, April 24. Take all the pills even if you feel fine.

**Weigh Yourself Every Day:**
- Use the same scale, in the morning, after using the bathroom, before eating.
- Write it down.
- Call your doctor if you gain 2 pounds in one day or 4–5 pounds in a week.

**Watch for These Warning Signs — Call Your Doctor:**
- Swollen ankles or legs
- More trouble breathing than usual
- Feeling very weak or having heart flutters
- Fever over 100.4°F

**Go to the Emergency Room or Call 911 If:**
- You cannot catch your breath
- You have chest pain
- You feel like you might pass out
- Your face droops, arm is weak, or speech is slurred

**Your Appointments:**
- Primary doctor: [Date] — do not miss this
- Heart doctor: [Date]
- Blood test: [Date at Lab Location] — very important, do not skip

**Who to Call:**
- Your doctor's office: [Number]
- If emergency: 911

Your daughter Alice has been told about your medicines. A nurse will visit you at home soon. Use your walker. Be careful on the stairs. We are glad you are feeling better.

## Conference Agenda (15 min)
1. **[2min] Physician** — Anticoagulation decision for chronic Afib
   *Key question: Will we initiate DOAC today, document contraindication, or defer to cardiology? Decision must be made before discharge order.*

2. **[2min] PT** — Stair-climb assessment status
   *Key question: Has PT evaluation occurred? Can patient safely negotiate 3 flights? If not cleared, are we activating SNF placement today?*

3. **[2min] Physician** — Discharge furosemide and KCl doses
   *Key question: What are the exact discharge doses? Has BMP been ordered and resulted? What hold parameters will be communicated to patient?*

4. **[2min] Pharmacist** — Medication reconciliation completeness
   *Key question: Are all prescriptions written? Is antibiotic supply confirmed in hand? Are high-risk interaction instructions documented?*

5. **[2min] MSW** — Daughter availability and Part D verification
   *Key question: Is Alice Chen confirmed for discharge teaching? Is Part D coverage verified for all discharge medications?*

6. **[2min] Nurse** — Teach-back completion status
   *Key question: Has teach-back been documented for daily weight, new medications, warning signs, and insulin? What remains before discharge?*

7. **[2min] Care Coordinator** — Home Health and follow-up appointments
   *Key question: Is Home Health referral submitted with first visit confirmed within 24–48 hours? Are PCP, cardiology, and BMP lab appointments scheduled and in writing?*

8. **[1min] MSW** — DME and safety equipment
   *Key question: Is medical alert device ordered? Are shower chair and grab bars ordered or confirmed in place?*

---
*Model: claude-opus-4-7 | Confidence: moderate | All five specialist agents provided comprehensive outputs. Confidence is moderate rather than high for three reasons: (1) The repeat BMP has not resulted — electrolyte and renal status on the new triple-therapy regimen is unknown, directly affecting medication dose finalization and safety determination. (2) Formal PT evaluation has not been documented — functional data is inferred from nursing notes; stair assessment has not occurred. (3) The anticoagulation gap cannot be fully adjudicated — no HAS-BLED score, bleeding history, or prior anticoagulation trial is documented, making it unclear whether omission is intentional or oversight. These are the three items that must be resolved before discharge readiness can be upgraded to 'conditional' or 'ready'.*