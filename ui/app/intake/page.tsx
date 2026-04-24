"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────

interface BasicInfo {
  name: string; age: string; sex: string;
  admissionDate: string; losDays: string;
  admissionType: string; unit: string; chiefComplaint: string;
}

interface PhysicianForm {
  primaryDx: string;
  secondaryDx: string[];
  medications: string;
  keyLabs: string;
  currentBp: string; currentHr: string; currentSpo2: string;
  comorbidities: string;
  emergencyAdmission: boolean;
  edVisitsPrior6mo: string;
  clinicalSummary: string;
  followUpPlan: string;
  safetyFlags: string;
}

interface NurseForm {
  educationReadiness: string;
  educationBarriers: string;
  medicationComplexity: string;
  injectionRequired: boolean;
  injectionEducationDone: boolean;
  adlStatus: string;
  adlConcerns: string;
  caregiverIdentified: boolean;
  caregiverName: string;
  caregiverAvailability: string;
  woundCareNeeds: string;
  warningSignsEducated: string;
  concerns: string;
}

interface PharmacistForm {
  reconciliationDone: boolean;
  highRiskMeds: string;
  drugInteractions: string;
  medsToStop: string;
  newMeds: string;
  allergies: string;
  insuranceCoverage: string;
  patientUnderstanding: string;
  counselingDone: boolean;
  concerns: string;
}

interface MSWForm {
  livingSituation: string;
  insurance: string;
  supportSystem: string;
  transportationAccess: boolean;
  transportationNotes: string;
  housingStability: string;
  foodSecurity: string;
  financialConcerns: string;
  mentalHealthConcerns: string;
  substanceUse: string;
  resourcesArranged: string;
  homeHealthNeeded: boolean;
  followUpArranged: boolean;
  followUpDetails: string;
  concerns: string;
}

interface PTForm {
  priorFunctionalStatus: string;
  ambulation: string;
  transferStatus: string;
  fallRisk: string;
  balanceImpaired: boolean;
  stairsAtHome: boolean;
  canManageStairs: boolean;
  equipmentNeeds: string;
  ptReferral: string;
  rehabNeeded: boolean;
  concerns: string;
}

const TAB_LABELS = [
  { id: "basic",      label: "BASIC INFO",  abbrev: "INFO" },
  { id: "physician",  label: "PHYSICIAN",   abbrev: "MD"   },
  { id: "nurse",      label: "NURSE",       abbrev: "RN"   },
  { id: "pharmacist", label: "PHARMACIST",  abbrev: "RPh"  },
  { id: "msw",        label: "SOC. WORK",   abbrev: "MSW"  },
  { id: "pt",         label: "PHYS. THERAPY", abbrev: "PT" },
] as const;

type TabId = typeof TAB_LABELS[number]["id"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function buildCaseJson(
  id: string,
  basic: BasicInfo,
  physician: PhysicianForm,
  nurse: NurseForm,
  pharmacist: PharmacistForm,
  msw: MSWForm,
  pt: PTForm,
) {
  return {
    _synthetic_notice: "ROUNDS.ai patient intake form — not real patient data.",
    case_id: `INTAKE-${id.slice(0, 8).toUpperCase()}`,
    patient: { name: basic.name, age: parseInt(basic.age) || 0, sex: basic.sex, mrn: `MRN-${id.slice(0,6).toUpperCase()}` },
    admission: {
      date: basic.admissionDate,
      primary_dx: physician.primaryDx,
      secondary_dx: physician.secondaryDx.filter(Boolean),
      los_days: parseInt(basic.losDays) || 1,
      admission_type: physician.emergencyAdmission ? "Emergency" : basic.admissionType,
      admitting_unit: basic.unit,
      chief_complaint: basic.chiefComplaint,
    },
    medications_freetext: physician.medications,
    key_labs: physician.keyLabs,
    current_vitals: { bp: physician.currentBp, hr: physician.currentHr, spo2_pct: physician.currentSpo2 },
    comorbidities: physician.comorbidities,
    clinical_summary: physician.clinicalSummary,
    follow_up_plan: physician.followUpPlan,
    safety_flags_noted: physician.safetyFlags,
    lace_inputs: {
      L_los_days: parseInt(basic.losDays) || 1,
      A_emergency_admission: physician.emergencyAdmission,
      E_ed_visits_prior_6_months: physician.edVisitsPrior6mo,
      C_comorbidities_note: physician.comorbidities,
    },
    functional_status: {
      adl_status: nurse.adlStatus,
      adl_concerns: nurse.adlConcerns,
      ambulation: pt.ambulation,
      transfer_status: pt.transferStatus,
      fall_risk: pt.fallRisk,
      balance_impaired: pt.balanceImpaired,
    },
    nursing_assessment: {
      education_readiness: nurse.educationReadiness,
      education_barriers: nurse.educationBarriers,
      medication_complexity: nurse.medicationComplexity,
      injection_required: nurse.injectionRequired,
      injection_education_done: nurse.injectionEducationDone,
      caregiver_identified: nurse.caregiverIdentified,
      caregiver_name: nurse.caregiverName,
      caregiver_availability: nurse.caregiverAvailability,
      wound_care_needs: nurse.woundCareNeeds,
      warning_signs_educated: nurse.warningSignsEducated,
      concerns: nurse.concerns,
    },
    pharmacy_assessment: {
      reconciliation_complete: pharmacist.reconciliationDone,
      high_risk_medications: pharmacist.highRiskMeds,
      drug_interactions: pharmacist.drugInteractions,
      medications_to_discontinue: pharmacist.medsToStop,
      new_medications_at_discharge: pharmacist.newMeds,
      drug_allergies: pharmacist.allergies,
      insurance_coverage: pharmacist.insuranceCoverage,
      patient_understanding: pharmacist.patientUnderstanding,
      counseling_complete: pharmacist.counselingDone,
      concerns: pharmacist.concerns,
    },
    social_work_assessment: {
      living_situation: msw.livingSituation,
      insurance_status: msw.insurance,
      support_system: msw.supportSystem,
      transportation_access: msw.transportationAccess,
      transportation_notes: msw.transportationNotes,
      housing_stability: msw.housingStability,
      food_security: msw.foodSecurity,
      financial_concerns: msw.financialConcerns,
      mental_health_concerns: msw.mentalHealthConcerns,
      substance_use: msw.substanceUse,
      community_resources_arranged: msw.resourcesArranged,
      home_health_needed: msw.homeHealthNeeded,
      follow_up_arranged: msw.followUpArranged,
      follow_up_details: msw.followUpDetails,
      concerns: msw.concerns,
    },
    pt_assessment: {
      prior_functional_status: pt.priorFunctionalStatus,
      stairs_at_home: pt.stairsAtHome,
      can_manage_stairs: pt.canManageStairs,
      equipment_needs: pt.equipmentNeeds,
      pt_referral: pt.ptReferral,
      rehab_facility_needed: pt.rehabNeeded,
      concerns: pt.concerns,
    },
  };
}

// ── Sub-form components ────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">
      {children}{required && <span className="text-critical-text ml-1">*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:border-info-border transition-colors"
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-info-border transition-colors"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-card">{o.label}</option>
      ))}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:border-info-border transition-colors resize-none"
    />
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-sm border transition-colors ${
        value
          ? "bg-ok-bg border-ok-border text-ok-text"
          : "bg-card border-border-subtle text-text-secondary"
      }`}
    >
      <span className={`w-3 h-3 rounded-full border ${value ? "bg-ok-text border-ok-text" : "border-text-tertiary"}`} />
      {label}
    </button>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function IntakePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTabs, setCompletedTabs] = useState<Set<TabId>>(new Set());

  const [basic, setBasic] = useState<BasicInfo>({
    name: "", age: "", sex: "F",
    admissionDate: new Date().toISOString().slice(0, 10),
    losDays: "", admissionType: "Elective", unit: "", chiefComplaint: "",
  });

  const [physician, setPhysician] = useState<PhysicianForm>({
    primaryDx: "", secondaryDx: ["", "", ""],
    medications: "", keyLabs: "",
    currentBp: "", currentHr: "", currentSpo2: "",
    comorbidities: "", emergencyAdmission: false, edVisitsPrior6mo: "0",
    clinicalSummary: "", followUpPlan: "", safetyFlags: "",
  });

  const [nurse, setNurse] = useState<NurseForm>({
    educationReadiness: "conditional", educationBarriers: "",
    medicationComplexity: "moderate", injectionRequired: false, injectionEducationDone: false,
    adlStatus: "independent", adlConcerns: "",
    caregiverIdentified: false, caregiverName: "", caregiverAvailability: "",
    woundCareNeeds: "", warningSignsEducated: "", concerns: "",
  });

  const [pharmacist, setPharmacist] = useState<PharmacistForm>({
    reconciliationDone: false, highRiskMeds: "", drugInteractions: "",
    medsToStop: "", newMeds: "", allergies: "",
    insuranceCoverage: "full", patientUnderstanding: "partial",
    counselingDone: false, concerns: "",
  });

  const [msw, setMsw] = useState<MSWForm>({
    livingSituation: "alone", insurance: "insured",
    supportSystem: "moderate", transportationAccess: true, transportationNotes: "",
    housingStability: "stable", foodSecurity: "secure",
    financialConcerns: "", mentalHealthConcerns: "", substanceUse: "",
    resourcesArranged: "", homeHealthNeeded: false,
    followUpArranged: false, followUpDetails: "", concerns: "",
  });

  const [pt, setPt] = useState<PTForm>({
    priorFunctionalStatus: "", ambulation: "independent",
    transferStatus: "independent", fallRisk: "low",
    balanceImpaired: false, stairsAtHome: false, canManageStairs: true,
    equipmentNeeds: "", ptReferral: "none", rehabNeeded: false, concerns: "",
  });

  const markComplete = useCallback((tab: TabId) => {
    setCompletedTabs((prev) => new Set(Array.from(prev).concat(tab)));
    const tabs = TAB_LABELS.map((t) => t.id);
    const idx = tabs.indexOf(tab);
    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1] as TabId);
  }, []);

  const ph = (obj: Partial<PhysicianForm>) => setPhysician((p) => ({ ...p, ...obj }));
  const nu = (obj: Partial<NurseForm>) => setNurse((p) => ({ ...p, ...obj }));
  const rx = (obj: Partial<PharmacistForm>) => setPharmacist((p) => ({ ...p, ...obj }));
  const sw = (obj: Partial<MSWForm>) => setMsw((p) => ({ ...p, ...obj }));
  const ptu = (obj: Partial<PTForm>) => setPt((p) => ({ ...p, ...obj }));

  async function handleSubmit() {
    if (!basic.name || !physician.primaryDx) {
      alert("Patient name and primary diagnosis are required.");
      return;
    }
    setIsSubmitting(true);
    const id = generateId();
    const caseJson = buildCaseJson(id, basic, physician, nurse, pharmacist, msw, pt);

    // Save intake form to localStorage
    const intakeRecord = { id, createdAt: new Date().toISOString(), basic, caseJson };
    const existing = JSON.parse(localStorage.getItem("rounds_patients") ?? "[]");
    existing.push(intakeRecord);
    localStorage.setItem("rounds_patients", JSON.stringify(existing));

    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientData: caseJson }),
      });
      if (!res.ok) throw new Error("Synthesis failed");
      const synthesis = await res.json();
      synthesis._intake_id = id;
      synthesis._intake_name = basic.name;
      localStorage.setItem(`rounds_synthesis_${id}`, JSON.stringify(synthesis));
      router.push(`/patient/${id}`);
    } catch (err) {
      console.error(err);
      alert("Synthesis failed. Check that the API is reachable.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const allKeyFieldsFilled = basic.name.trim() && physician.primaryDx.trim();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">NEW PATIENT · DISCHARGE PLANNING INTAKE</div>
        <h1 className="text-xl font-mono font-semibold text-text-primary">Patient Intake Form</h1>
        <p className="text-xs text-text-secondary mt-1">
          Each clinical role completes their section. When all roles are done, run the AI synthesis.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-stretch border border-border-subtle rounded-sm overflow-hidden mb-6">
        {TAB_LABELS.map((tab) => {
          const done = completedTabs.has(tab.id);
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-2xs font-mono uppercase tracking-wider transition-colors border-r border-border-subtle last:border-0 ${
                active
                  ? "bg-info-bg text-info-text border-b-2 border-b-info"
                  : done
                  ? "bg-ok-bg text-ok-text"
                  : "bg-card text-text-tertiary hover:text-text-secondary hover:bg-white/5"
              }`}
            >
              <span className="hidden sm:block">{tab.label}</span>
              <span className="sm:hidden">{tab.abbrev}</span>
              {done && <span className="text-ok-text">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-panel border border-border-subtle rounded-sm p-5 space-y-4">

        {/* ── BASIC INFO ── */}
        {activeTab === "basic" && (
          <>
            <SectionTitle>Patient Demographics</SectionTitle>
            <FieldRow>
              <Field><Label required>Patient Name</Label><Input value={basic.name} onChange={(v) => setBasic(p => ({ ...p, name: v }))} placeholder="Full name" /></Field>
              <Field><Label required>Age</Label><Input value={basic.age} onChange={(v) => setBasic(p => ({ ...p, age: v }))} placeholder="e.g. 72" /></Field>
            </FieldRow>
            <FieldRow>
              <Field><Label>Sex</Label>
                <Select value={basic.sex} onChange={(v) => setBasic(p => ({ ...p, sex: v }))} options={[{value:"F",label:"Female"},{value:"M",label:"Male"},{value:"Other",label:"Other"}]} />
              </Field>
              <Field><Label>Admission Date</Label><Input type="date" value={basic.admissionDate} onChange={(v) => setBasic(p => ({ ...p, admissionDate: v }))} /></Field>
            </FieldRow>
            <FieldRow>
              <Field><Label required>Length of Stay (days)</Label><Input value={basic.losDays} onChange={(v) => setBasic(p => ({ ...p, losDays: v }))} placeholder="e.g. 4" /></Field>
              <Field><Label>Admission Type</Label>
                <Select value={basic.admissionType} onChange={(v) => setBasic(p => ({ ...p, admissionType: v }))} options={[{value:"Emergency",label:"Emergency"},{value:"Urgent",label:"Urgent"},{value:"Elective",label:"Elective"}]} />
              </Field>
            </FieldRow>
            <Field><Label>Ward / Unit</Label><Input value={basic.unit} onChange={(v) => setBasic(p => ({ ...p, unit: v }))} placeholder="e.g. Medicine / Cardiology" /></Field>
            <Field><Label required>Chief Complaint</Label><Textarea value={basic.chiefComplaint} onChange={(v) => setBasic(p => ({ ...p, chiefComplaint: v }))} placeholder="Reason for admission in 1–2 sentences" /></Field>
            <CompleteButton onClick={() => markComplete("basic")} />
          </>
        )}

        {/* ── PHYSICIAN ── */}
        {activeTab === "physician" && (
          <>
            <SectionTitle role="PHYSICIAN (MD)">Diagnosis & Clinical Status</SectionTitle>
            <Field><Label required>Primary Diagnosis</Label><Input value={physician.primaryDx} onChange={(v) => ph({ primaryDx: v })} placeholder="e.g. CHF exacerbation (I50.9)" /></Field>
            <div>
              <Label>Secondary Diagnoses (up to 3)</Label>
              {[0,1,2].map((i) => (
                <div key={i} className="mb-1">
                  <Input
                    value={physician.secondaryDx[i] ?? ""}
                    onChange={(v) => { const d = [...physician.secondaryDx]; d[i] = v; ph({ secondaryDx: d }); }}
                    placeholder={`Secondary Dx ${i + 1}`}
                  />
                </div>
              ))}
            </div>
            <Field>
              <Label>Current Medications</Label>
              <Textarea value={physician.medications} onChange={(v) => ph({ medications: v })} rows={4}
                placeholder="List medications with dose, route, frequency. Flag any high-risk or teratogenic meds." />
            </Field>
            <Field><Label>Key Lab Values</Label><Textarea value={physician.keyLabs} onChange={(v) => ph({ keyLabs: v })} placeholder="e.g. HbA1c 11.4%, Cr 0.8, Na 136, glucose 112, pH 7.39" /></Field>
            <SectionTitle>Current Vitals</SectionTitle>
            <FieldRow>
              <Field><Label>Blood Pressure</Label><Input value={physician.currentBp} onChange={(v) => ph({ currentBp: v })} placeholder="e.g. 122/78" /></Field>
              <Field><Label>Heart Rate (bpm)</Label><Input value={physician.currentHr} onChange={(v) => ph({ currentHr: v })} placeholder="e.g. 80" /></Field>
            </FieldRow>
            <Field><Label>SpO2 (%)</Label><Input value={physician.currentSpo2} onChange={(v) => ph({ currentSpo2: v })} placeholder="e.g. 98% on room air" /></Field>
            <SectionTitle>LACE Risk Factors</SectionTitle>
            <FieldRow>
              <Field>
                <Label>Emergency admission?</Label>
                <Toggle value={physician.emergencyAdmission} onChange={(v) => ph({ emergencyAdmission: v })} label={physician.emergencyAdmission ? "Yes — Emergency" : "No — Elective/Urgent"} />
              </Field>
              <Field><Label>ED visits in prior 6 months</Label>
                <Select value={physician.edVisitsPrior6mo} onChange={(v) => ph({ edVisitsPrior6mo: v })}
                  options={[{value:"0",label:"0"},{value:"1",label:"1"},{value:"2-3",label:"2–3"},{value:"4+",label:"4+"}]} />
              </Field>
            </FieldRow>
            <Field><Label>Comorbidities (for Charlson score)</Label><Textarea value={physician.comorbidities} onChange={(v) => ph({ comorbidities: v })} placeholder="List relevant comorbidities: DM, CHF, COPD, CKD, malignancy, etc." /></Field>
            <Field><Label>Clinical Summary</Label><Textarea value={physician.clinicalSummary} onChange={(v) => ph({ clinicalSummary: v })} rows={4} placeholder="3–5 sentences summarizing hospital course and current status" /></Field>
            <Field><Label>Follow-up Plan</Label><Textarea value={physician.followUpPlan} onChange={(v) => ph({ followUpPlan: v })} placeholder="Specialty + timeframe: e.g. Cardiology within 1 week, PCP within 2 weeks" /></Field>
            <Field><Label>Safety Flags / Critical Issues</Label><Textarea value={physician.safetyFlags} onChange={(v) => ph({ safetyFlags: v })} placeholder="Any safety concerns that could delay discharge or increase readmission risk" /></Field>
            <CompleteButton onClick={() => markComplete("physician")} />
          </>
        )}

        {/* ── NURSE ── */}
        {activeTab === "nurse" && (
          <>
            <SectionTitle role="NURSE (RN)">Patient Education & Functional Status</SectionTitle>
            <FieldRow>
              <Field><Label>Education Readiness</Label>
                <Select value={nurse.educationReadiness} onChange={(v) => nu({ educationReadiness: v })}
                  options={[{value:"ready",label:"Ready"},{value:"conditional",label:"Conditional"},{value:"not_ready",label:"Not Ready"}]} />
              </Field>
              <Field><Label>Medication Complexity</Label>
                <Select value={nurse.medicationComplexity} onChange={(v) => nu({ medicationComplexity: v })}
                  options={[{value:"low",label:"Low"},{value:"moderate",label:"Moderate"},{value:"high",label:"High"},{value:"very_high",label:"Very High"}]} />
              </Field>
            </FieldRow>
            <Field><Label>Education Barriers</Label><Textarea value={nurse.educationBarriers} onChange={(v) => nu({ educationBarriers: v })} placeholder="e.g. language barrier, low health literacy, cognitive impairment, distress/denial" /></Field>
            <FieldRow>
              <Field>
                <Label>Injection required at home?</Label>
                <Toggle value={nurse.injectionRequired} onChange={(v) => nu({ injectionRequired: v })} label={nurse.injectionRequired ? "Yes" : "No"} />
              </Field>
              {nurse.injectionRequired && (
                <Field>
                  <Label>Injection education complete?</Label>
                  <Toggle value={nurse.injectionEducationDone} onChange={(v) => nu({ injectionEducationDone: v })} label={nurse.injectionEducationDone ? "Complete" : "Incomplete"} />
                </Field>
              )}
            </FieldRow>
            <SectionTitle>ADL & Functional Status</SectionTitle>
            <Field><Label>Overall ADL Status</Label>
              <Select value={nurse.adlStatus} onChange={(v) => nu({ adlStatus: v })}
                options={[{value:"independent",label:"Independent"},{value:"minimal_assist",label:"Minimal Assistance"},{value:"moderate_assist",label:"Moderate Assistance"},{value:"max_assist",label:"Maximum Assistance"},{value:"dependent",label:"Fully Dependent"}]} />
            </Field>
            <Field><Label>ADL Concerns</Label><Textarea value={nurse.adlConcerns} onChange={(v) => nu({ adlConcerns: v })} placeholder="Specific difficulties with bathing, dressing, transfers, continence, feeding" /></Field>
            <SectionTitle>Caregiver Assessment</SectionTitle>
            <Field>
              <Label>Caregiver identified?</Label>
              <Toggle value={nurse.caregiverIdentified} onChange={(v) => nu({ caregiverIdentified: v })} label={nurse.caregiverIdentified ? "Yes — identified" : "No caregiver"} />
            </Field>
            {nurse.caregiverIdentified && (
              <FieldRow>
                <Field><Label>Caregiver Name / Relation</Label><Input value={nurse.caregiverName} onChange={(v) => nu({ caregiverName: v })} placeholder="e.g. Spouse / Son / Home aide" /></Field>
                <Field><Label>Availability</Label><Input value={nurse.caregiverAvailability} onChange={(v) => nu({ caregiverAvailability: v })} placeholder="e.g. Full-time / Weekdays only / 2 hrs/day" /></Field>
              </FieldRow>
            )}
            <Field><Label>Wound / Device Care Needs</Label><Input value={nurse.woundCareNeeds} onChange={(v) => nu({ woundCareNeeds: v })} placeholder="e.g. Daily wound dressing, G-tube care, catheter maintenance, or none" /></Field>
            <Field><Label>Warning Signs Educated (completed topics)</Label><Textarea value={nurse.warningSignsEducated} onChange={(v) => nu({ warningSignsEducated: v })} placeholder="e.g. Weight gain >2kg, blood glucose targets, signs of DKA, when to call 911" /></Field>
            <Field><Label>Nursing Concerns / Observations</Label><Textarea value={nurse.concerns} onChange={(v) => nu({ concerns: v })} placeholder="Anything not captured above — patient demeanor, safety concerns, follow-up worries" /></Field>
            <CompleteButton onClick={() => markComplete("nurse")} />
          </>
        )}

        {/* ── PHARMACIST ── */}
        {activeTab === "pharmacist" && (
          <>
            <SectionTitle role="PHARMACIST (RPh)">Medication Review & Counseling</SectionTitle>
            <FieldRow>
              <Field>
                <Label>Medication reconciliation complete?</Label>
                <Toggle value={pharmacist.reconciliationDone} onChange={(v) => rx({ reconciliationDone: v })} label={pharmacist.reconciliationDone ? "Complete" : "Incomplete"} />
              </Field>
              <Field>
                <Label>Patient counseling complete?</Label>
                <Toggle value={pharmacist.counselingDone} onChange={(v) => rx({ counselingDone: v })} label={pharmacist.counselingDone ? "Complete" : "Incomplete"} />
              </Field>
            </FieldRow>
            <Field><Label>Drug Allergies / Adverse Reactions</Label><Input value={pharmacist.allergies} onChange={(v) => rx({ allergies: v })} placeholder="e.g. Penicillin — rash, Sulfa — anaphylaxis, or NKDA" /></Field>
            <Field><Label>High-Risk Medications Identified</Label><Textarea value={pharmacist.highRiskMeds} onChange={(v) => rx({ highRiskMeds: v })} placeholder="e.g. warfarin, insulin, opioids, digoxin, narrow therapeutic index drugs, teratogens" /></Field>
            <Field><Label>Drug Interactions of Concern</Label><Textarea value={pharmacist.drugInteractions} onChange={(v) => rx({ drugInteractions: v })} placeholder="e.g. warfarin + amoxicillin → increased INR, or none identified" /></Field>
            <Field><Label>Medications to Discontinue at Discharge</Label><Textarea value={pharmacist.medsToStop} onChange={(v) => rx({ medsToStop: v })} placeholder="e.g. IV heparin drip, IV furosemide — transitioning to oral" /></Field>
            <Field><Label>New Medications at Discharge</Label><Textarea value={pharmacist.newMeds} onChange={(v) => rx({ newMeds: v })} placeholder="Medications newly prescribed for discharge" /></Field>
            <FieldRow>
              <Field><Label>Insurance / Drug Coverage</Label>
                <Select value={pharmacist.insuranceCoverage} onChange={(v) => rx({ insuranceCoverage: v })}
                  options={[{value:"full",label:"Full coverage"},{value:"partial",label:"Partial — copays/gaps"},{value:"none",label:"Uninsured / No coverage"}]} />
              </Field>
              <Field><Label>Patient Medication Understanding</Label>
                <Select value={pharmacist.patientUnderstanding} onChange={(v) => rx({ patientUnderstanding: v })}
                  options={[{value:"good",label:"Good — can explain back"},{value:"partial",label:"Partial — gaps remain"},{value:"poor",label:"Poor — needs re-education"}]} />
              </Field>
            </FieldRow>
            <Field><Label>Pharmacy Concerns / Notes</Label><Textarea value={pharmacist.concerns} onChange={(v) => rx({ concerns: v })} placeholder="Affordability issues, complex regimens, high-risk meds requiring monitoring, etc." /></Field>
            <CompleteButton onClick={() => markComplete("pharmacist")} />
          </>
        )}

        {/* ── SOCIAL WORKER ── */}
        {activeTab === "msw" && (
          <>
            <SectionTitle role="SOCIAL WORKER (MSW)">Social Determinants & Discharge Resources</SectionTitle>
            <FieldRow>
              <Field><Label>Living Situation</Label>
                <Select value={msw.livingSituation} onChange={(v) => sw({ livingSituation: v })}
                  options={[{value:"alone",label:"Lives alone"},{value:"with_spouse",label:"With spouse/partner"},{value:"with_family",label:"With family"},{value:"assisted_living",label:"Assisted living"},{value:"nursing_home",label:"Nursing home"},{value:"homeless",label:"Homeless / unstable"}]} />
              </Field>
              <Field><Label>Insurance Status</Label>
                <Select value={msw.insurance} onChange={(v) => sw({ insurance: v })}
                  options={[{value:"insured",label:"Insured (private)"},{value:"medicare",label:"Medicare"},{value:"medicaid",label:"Medicaid"},{value:"medicaid_pending",label:"Medicaid pending"},{value:"dual",label:"Medicare + Medicaid"},{value:"uninsured",label:"Uninsured"}]} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field><Label>Support System Strength</Label>
                <Select value={msw.supportSystem} onChange={(v) => sw({ supportSystem: v })}
                  options={[{value:"strong",label:"Strong — reliable family/friends"},{value:"moderate",label:"Moderate — some support"},{value:"limited",label:"Limited — occasional only"},{value:"none",label:"None — isolated"}]} />
              </Field>
              <Field><Label>Housing Stability</Label>
                <Select value={msw.housingStability} onChange={(v) => sw({ housingStability: v })}
                  options={[{value:"stable",label:"Stable"},{value:"at_risk",label:"At risk (month-to-month, behind on rent)"},{value:"unstable",label:"Unstable"},{value:"homeless",label:"No housing"}]} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field><Label>Food Security</Label>
                <Select value={msw.foodSecurity} onChange={(v) => sw({ foodSecurity: v })}
                  options={[{value:"secure",label:"Food secure"},{value:"insecure",label:"Food insecure (relying on food bank, skipping meals)"}]} />
              </Field>
              <Field>
                <Label>Transportation Access</Label>
                <Toggle value={msw.transportationAccess} onChange={(v) => sw({ transportationAccess: v })} label={msw.transportationAccess ? "Has reliable transportation" : "Transportation barrier"} />
              </Field>
            </FieldRow>
            <Field><Label>Transportation Notes</Label><Input value={msw.transportationNotes} onChange={(v) => sw({ transportationNotes: v })} placeholder="e.g. Car, public transit, relies on family, no car — medical transport needed" /></Field>
            <Field><Label>Financial Concerns</Label><Textarea value={msw.financialConcerns} onChange={(v) => sw({ financialConcerns: v })} placeholder="Medication cost, copays, inability to take time off work, utility shutoff, etc." /></Field>
            <Field><Label>Mental Health Concerns</Label><Input value={msw.mentalHealthConcerns} onChange={(v) => sw({ mentalHealthConcerns: v })} placeholder="Depression, anxiety, PTSD, prior psychiatric history — or none identified" /></Field>
            <Field><Label>Substance Use</Label><Input value={msw.substanceUse} onChange={(v) => sw({ substanceUse: v })} placeholder="Tobacco, alcohol, substances — or none reported" /></Field>
            <Field><Label>Community Resources Arranged</Label><Textarea value={msw.resourcesArranged} onChange={(v) => sw({ resourcesArranged: v })} placeholder="e.g. Home health referral, Meals on Wheels, patient assistance program, food pantry, housing voucher" /></Field>
            <FieldRow>
              <Field>
                <Label>Home health needed?</Label>
                <Toggle value={msw.homeHealthNeeded} onChange={(v) => sw({ homeHealthNeeded: v })} label={msw.homeHealthNeeded ? "Yes — ordered" : "No"} />
              </Field>
              <Field>
                <Label>Follow-up care arranged?</Label>
                <Toggle value={msw.followUpArranged} onChange={(v) => sw({ followUpArranged: v })} label={msw.followUpArranged ? "Yes — scheduled" : "Not yet"} />
              </Field>
            </FieldRow>
            {msw.followUpArranged && (
              <Field><Label>Follow-up Details</Label><Input value={msw.followUpDetails} onChange={(v) => sw({ followUpDetails: v })} placeholder="Provider name, date, location, transport arranged?" /></Field>
            )}
            <Field><Label>Social Work Concerns</Label><Textarea value={msw.concerns} onChange={(v) => sw({ concerns: v })} placeholder="Any unresolved barriers, safety concerns, or items requiring escalation" /></Field>
            <CompleteButton onClick={() => markComplete("msw")} />
          </>
        )}

        {/* ── PHYSICAL THERAPIST ── */}
        {activeTab === "pt" && (
          <>
            <SectionTitle role="PHYSICAL THERAPIST (PT)">Functional Assessment & Mobility</SectionTitle>
            <Field><Label>Prior Functional Status (pre-admission baseline)</Label><Textarea value={pt.priorFunctionalStatus} onChange={(v) => ptu({ priorFunctionalStatus: v })} placeholder="e.g. Fully independent, walking 1 mile/day — or uses walker at baseline, limited to home" /></Field>
            <FieldRow>
              <Field><Label>Current Ambulation</Label>
                <Select value={pt.ambulation} onChange={(v) => ptu({ ambulation: v })}
                  options={[{value:"independent",label:"Independent"},{value:"supervised",label:"Supervised"},{value:"cane",label:"Cane"},{value:"walker",label:"Walker"},{value:"wheelchair",label:"Wheelchair — partial weight bearing"},{value:"wheelchair_full",label:"Wheelchair — non-ambulatory"},{value:"bedbound",label:"Bedbound"}]} />
              </Field>
              <Field><Label>Transfer Status</Label>
                <Select value={pt.transferStatus} onChange={(v) => ptu({ transferStatus: v })}
                  options={[{value:"independent",label:"Independent"},{value:"supervised",label:"Supervised"},{value:"min_assist",label:"Minimal assist (25%)"},{value:"mod_assist",label:"Moderate assist (50%)"},{value:"max_assist",label:"Maximum assist (75%)"},{value:"dependent",label:"Dependent (100%)"}]} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field><Label>Fall Risk</Label>
                <Select value={pt.fallRisk} onChange={(v) => ptu({ fallRisk: v })}
                  options={[{value:"low",label:"Low"},{value:"moderate",label:"Moderate"},{value:"high",label:"High"}]} />
              </Field>
              <Field>
                <Label>Balance impaired?</Label>
                <Toggle value={pt.balanceImpaired} onChange={(v) => ptu({ balanceImpaired: v })} label={pt.balanceImpaired ? "Yes — impaired" : "No — intact"} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field>
                <Label>Stairs at home?</Label>
                <Toggle value={pt.stairsAtHome} onChange={(v) => ptu({ stairsAtHome: v })} label={pt.stairsAtHome ? "Yes — has stairs" : "No stairs"} />
              </Field>
              {pt.stairsAtHome && (
                <Field>
                  <Label>Can patient manage stairs?</Label>
                  <Toggle value={pt.canManageStairs} onChange={(v) => ptu({ canManageStairs: v })} label={pt.canManageStairs ? "Yes — cleared for stairs" : "No — barrier"} />
                </Field>
              )}
            </FieldRow>
            <Field><Label>Equipment Needs at Discharge</Label><Textarea value={pt.equipmentNeeds} onChange={(v) => ptu({ equipmentNeeds: v })} placeholder="e.g. Walker (ordered), grab bars needed, shower chair, bedside commode — or none" /></Field>
            <FieldRow>
              <Field><Label>PT / OT Referral</Label>
                <Select value={pt.ptReferral} onChange={(v) => ptu({ ptReferral: v })}
                  options={[{value:"none",label:"None needed"},{value:"outpatient_pt",label:"Outpatient PT"},{value:"home_pt",label:"Home PT"},{value:"outpatient_ot",label:"Outpatient OT"},{value:"home_ot",label:"Home OT"},{value:"both_pt_ot",label:"Both PT + OT"}]} />
              </Field>
              <Field>
                <Label>Rehab facility needed?</Label>
                <Toggle value={pt.rehabNeeded} onChange={(v) => ptu({ rehabNeeded: v })} label={pt.rehabNeeded ? "Yes — SNF/IRF referral" : "No — home discharge"} />
              </Field>
            </FieldRow>
            <Field><Label>PT Concerns / Notes</Label><Textarea value={pt.concerns} onChange={(v) => ptu({ concerns: v })} placeholder="Safety concerns, barriers to home discharge, equipment delays, caregiver training needed" /></Field>
            <CompleteButton onClick={() => markComplete("pt")} />
          </>
        )}
      </div>

      {/* Submit */}
      <div className="mt-6 border border-border-subtle rounded-sm p-4 bg-panel">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs font-mono text-text-secondary">
              Tabs completed:{" "}
              <span className={completedTabs.size === 6 ? "text-ok-text" : "text-warning-text"}>
                {completedTabs.size} / 6
              </span>
            </div>
            <div className="text-2xs text-text-tertiary mt-0.5">
              Basic info + physician diagnosis required. All other sections recommended.
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!allKeyFieldsFilled || isSubmitting}
            className={`px-6 py-2.5 rounded-sm font-mono text-sm font-semibold transition-colors ${
              allKeyFieldsFilled && !isSubmitting
                ? "bg-accent text-white hover:bg-accent/80"
                : "bg-card text-text-tertiary border border-border-subtle cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Running synthesis…" : "Run Discharge Analysis →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, role }: { children: React.ReactNode; role?: string }) {
  return (
    <div className="pt-2 pb-1">
      {role && <div className="text-2xs font-mono uppercase tracking-widest text-accent-text mb-0.5">{role}</div>}
      <div className="text-xs font-mono uppercase tracking-wider text-text-secondary border-b border-border-subtle pb-1">{children}</div>
    </div>
  );
}

function CompleteButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="pt-2 flex justify-end">
      <button
        type="button"
        onClick={onClick}
        className="px-4 py-2 bg-ok-bg border border-ok-border text-ok-text font-mono text-xs rounded-sm hover:bg-ok/20 transition-colors"
      >
        Mark complete & next →
      </button>
    </div>
  );
}
