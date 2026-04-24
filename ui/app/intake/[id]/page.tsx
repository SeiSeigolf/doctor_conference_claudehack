"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getPatient, savePatient, saveSynthesis, buildCaseJson,
  PatientRecord, PhysicianData, NurseData, PharmacistData, MSWData, PTData,
  RoleKey, ROLE_KEYS, ROLE_LABELS, ROLE_ABBREV, completedRoles,
} from "../../lib/patientStore";

type TabId = "basic" | "physician" | "nurse" | "pharmacist" | "msw" | "pt";

// ── Field helpers ──────────────────────────────────────────────────────────────

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
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:border-info-border transition-colors" />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:border-info-border transition-colors resize-none" />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-info-border transition-colors">
      {options.map((o) => <option key={o.value} value={o.value} className="bg-card">{o.label}</option>)}
    </select>
  );
}

function Toggle({ value, onChange, yes, no }: { value: boolean; onChange: (v: boolean) => void; yes: string; no: string }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-sm border transition-colors ${
        value ? "bg-ok-bg border-ok-border text-ok-text" : "bg-card border-border-subtle text-text-secondary"
      }`}>
      <span className={`w-3 h-3 rounded-full border ${value ? "bg-ok-text border-ok-text" : "border-text-tertiary"}`} />
      {value ? yes : no}
    </button>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function SaveButton({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <div className="flex justify-end pt-3 border-t border-border-subtle">
      <button onClick={onClick} disabled={saving}
        className={`px-5 py-2 rounded-sm font-mono text-xs font-semibold transition-colors ${
          saved ? "bg-ok-bg border border-ok-border text-ok-text" :
          "bg-info-bg border border-info-border text-info-text hover:bg-info/20"
        }`}>
        {saving ? "Saving…" : saved ? "✓ Saved" : "Save Notes"}
      </button>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PatientIntakePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("physician");
  const [saving, setSaving] = useState(false);
  const [savedTab, setSavedTab] = useState<TabId | null>(null);
  const [synthesizing, setSynthesizing] = useState(false);

  // Per-role form state
  const [physician, setPhysician] = useState<Omit<PhysicianData, "savedAt">>({
    primaryDx: "", secondaryDx: ["", "", ""], medications: "", keyLabs: "",
    currentBp: "", currentHr: "", currentSpo2: "", comorbidities: "",
    emergencyAdmission: false, edVisitsPrior6mo: "0",
    clinicalSummary: "", followUpPlan: "", safetyFlags: "",
  });

  const [nurse, setNurse] = useState<Omit<NurseData, "savedAt">>({
    educationReadiness: "conditional", educationBarriers: "",
    medicationComplexity: "moderate", injectionRequired: false, injectionEducationDone: false,
    adlStatus: "independent", adlConcerns: "",
    caregiverIdentified: false, caregiverName: "", caregiverAvailability: "",
    woundCareNeeds: "", warningSignsEducated: "", concerns: "",
  });

  const [pharmacist, setPharmacist] = useState<Omit<PharmacistData, "savedAt">>({
    reconciliationDone: false, highRiskMeds: "", drugInteractions: "",
    medsToStop: "", newMeds: "", allergies: "",
    insuranceCoverage: "full", patientUnderstanding: "partial",
    counselingDone: false, concerns: "",
  });

  const [msw, setMsw] = useState<Omit<MSWData, "savedAt">>({
    livingSituation: "alone", insurance: "insured", supportSystem: "moderate",
    transportationAccess: true, transportationNotes: "", housingStability: "stable",
    foodSecurity: "secure", financialConcerns: "", mentalHealthConcerns: "",
    substanceUse: "", resourcesArranged: "", homeHealthNeeded: false,
    followUpArranged: false, followUpDetails: "", concerns: "",
  });

  const [pt, setPt] = useState<Omit<PTData, "savedAt">>({
    priorFunctionalStatus: "", ambulation: "independent", transferStatus: "independent",
    fallRisk: "low", balanceImpaired: false, stairsAtHome: false, canManageStairs: true,
    equipmentNeeds: "", ptReferral: "none", rehabNeeded: false, concerns: "",
  });

  // Load patient + pre-fill forms from saved data
  useEffect(() => {
    const p = getPatient(id);
    if (!p) { router.push("/"); return; }
    setPatient(p);
    if (p.physician) setPhysician(p.physician);
    if (p.nurse)     setNurse(p.nurse);
    if (p.pharmacist) setPharmacist(p.pharmacist);
    if (p.msw)       setMsw(p.msw);
    if (p.pt)        setPt(p.pt);
  }, [id, router]);

  const saveRole = useCallback((tab: TabId) => {
    if (!patient) return;
    setSaving(true);
    const now = new Date().toISOString();
    const updated = { ...patient };
    if (tab === "physician") updated.physician = { ...physician, savedAt: now };
    if (tab === "nurse")     updated.nurse     = { ...nurse,     savedAt: now };
    if (tab === "pharmacist") updated.pharmacist = { ...pharmacist, savedAt: now };
    if (tab === "msw")       updated.msw       = { ...msw,       savedAt: now };
    if (tab === "pt")        updated.pt        = { ...pt,        savedAt: now };
    savePatient(updated);
    setPatient(updated);
    setSavedTab(tab);
    setSaving(false);
    setTimeout(() => setSavedTab(null), 2000);
  }, [patient, physician, nurse, pharmacist, msw, pt]);

  async function handleSynthesize() {
    if (!patient) return;
    setSynthesizing(true);
    try {
      const caseJson = buildCaseJson(patient);
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientData: caseJson }),
      });
      if (!res.ok) throw new Error("Synthesis failed");
      const result = await res.json();
      result._intake_id = patient.id;
      result._intake_name = patient.basic.name;
      saveSynthesis(patient.id, result);
      router.push(`/patient/${patient.id}`);
    } catch (err) {
      console.error(err);
      alert("Synthesis failed. Check API.");
    } finally {
      setSynthesizing(false);
    }
  }

  if (!patient) {
    return <div className="py-20 text-center text-2xs font-mono uppercase tracking-widest text-text-tertiary animate-pulse">Loading…</div>;
  }

  const done = completedRoles(patient);
  const ph = (obj: Partial<typeof physician>) => setPhysician((p) => ({ ...p, ...obj }));
  const nu = (obj: Partial<typeof nurse>) => setNurse((p) => ({ ...p, ...obj }));
  const rx = (obj: Partial<typeof pharmacist>) => setPharmacist((p) => ({ ...p, ...obj }));
  const sw = (obj: Partial<typeof msw>) => setMsw((p) => ({ ...p, ...obj }));
  const ptu = (obj: Partial<typeof pt>) => setPt((p) => ({ ...p, ...obj }));

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">PATIENT INTAKE · IN PROGRESS</div>
          <h1 className="text-xl font-mono font-semibold text-text-primary">{patient.basic.name}</h1>
          <div className="text-xs text-text-secondary mt-0.5">
            {patient.basic.age}{patient.basic.sex} · {patient.basic.chiefComplaint || "No chief complaint"}
          </div>
        </div>
        <Link href="/" className="text-2xs font-mono text-text-tertiary hover:text-text-secondary transition-colors">← Patient list</Link>
      </div>

      {/* Role completion status */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ROLE_KEYS.map((role) => {
          const isDone = done.includes(role);
          const saved = patient[role];
          return (
            <button key={role} onClick={() => setActiveTab(role as TabId)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono text-2xs uppercase tracking-wider transition-colors ${
                activeTab === role
                  ? "bg-info-bg border-info-border text-info-text"
                  : isDone
                  ? "bg-ok-bg border-ok-border text-ok-text"
                  : "bg-card border-border-subtle text-text-tertiary hover:border-border-hover"
              }`}>
              <span>{ROLE_ABBREV[role]}</span>
              {isDone && <span>✓</span>}
              {saved && <span className="text-2xs opacity-60">· {new Date(saved.savedAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>}
            </button>
          );
        })}
      </div>

      {/* Form panel */}
      <div className="bg-panel border border-border-subtle rounded-sm p-5 space-y-4">
        {/* Role header */}
        <div className="pb-2 border-b border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-2xs font-mono uppercase tracking-widest text-accent-text">
              {activeTab === "basic" ? "PATIENT INFO" : ROLE_LABELS[activeTab as keyof typeof ROLE_LABELS]}
            </div>
            <div className="text-xs text-text-secondary mt-0.5">
              {patient[activeTab as keyof PatientRecord] && typeof patient[activeTab as keyof PatientRecord] === "object"
                ? `Last saved: ${new Date((patient[activeTab as keyof PatientRecord] as { savedAt: string }).savedAt ?? patient.updatedAt).toLocaleString()}`
                : "Not yet saved"}
            </div>
          </div>
          {done.includes(activeTab as RoleKey) && (
            <span className="text-2xs font-mono text-ok-text bg-ok-bg border border-ok-border px-2 py-0.5 rounded-sm">SAVED</span>
          )}
        </div>

        {/* ── BASIC (read-only summary) ── */}
        {activeTab === "basic" && (
          <div className="space-y-3">
            <div className="text-2xs font-mono text-text-tertiary">Basic info is set at creation. To edit, contact the person who created the record.</div>
            {Object.entries(patient.basic).map(([k, v]) => v && (
              <div key={k} className="flex gap-3">
                <span className="text-2xs font-mono uppercase tracking-wider text-text-tertiary w-28 flex-shrink-0">{k.replace(/([A-Z])/g, " $1")}</span>
                <span className="text-xs font-mono text-text-primary">{String(v)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── PHYSICIAN ── */}
        {activeTab === "physician" && (
          <>
            <div>
              <Label required>Primary Diagnosis</Label>
              <Input value={physician.primaryDx} onChange={(v) => ph({ primaryDx: v })} placeholder="e.g. CHF exacerbation (I50.9)" />
            </div>
            <div>
              <Label>Secondary Diagnoses (up to 3)</Label>
              {[0,1,2].map((i) => (
                <div key={i} className="mb-1">
                  <Input value={physician.secondaryDx[i] ?? ""} onChange={(v) => { const d = [...physician.secondaryDx]; d[i] = v; ph({ secondaryDx: d }); }} placeholder={`Secondary Dx ${i+1}`} />
                </div>
              ))}
            </div>
            <div>
              <Label>Current Medications</Label>
              <Textarea value={physician.medications} onChange={(v) => ph({ medications: v })} rows={4} placeholder="Name · dose · route · frequency. Flag teratogenic or high-risk meds." />
            </div>
            <div><Label>Key Lab Values</Label><Textarea value={physician.keyLabs} onChange={(v) => ph({ keyLabs: v })} placeholder="e.g. HbA1c 11.4%, Cr 0.8, Na 136, pH 7.39" /></div>
            <Row>
              <div><Label>Blood Pressure</Label><Input value={physician.currentBp} onChange={(v) => ph({ currentBp: v })} placeholder="e.g. 122/78" /></div>
              <div><Label>Heart Rate</Label><Input value={physician.currentHr} onChange={(v) => ph({ currentHr: v })} placeholder="e.g. 80 bpm" /></div>
            </Row>
            <div><Label>SpO2</Label><Input value={physician.currentSpo2} onChange={(v) => ph({ currentSpo2: v })} placeholder="e.g. 98% RA" /></div>
            <Row>
              <div>
                <Label>Emergency admission?</Label>
                <Toggle value={physician.emergencyAdmission} onChange={(v) => ph({ emergencyAdmission: v })} yes="Yes — Emergency" no="No — Elective/Urgent" />
              </div>
              <div>
                <Label>ED visits in prior 6 months</Label>
                <Select value={physician.edVisitsPrior6mo} onChange={(v) => ph({ edVisitsPrior6mo: v })}
                  options={[{value:"0",label:"0"},{value:"1",label:"1"},{value:"2-3",label:"2–3"},{value:"4+",label:"4+"}]} />
              </div>
            </Row>
            <div><Label>Comorbidities</Label><Textarea value={physician.comorbidities} onChange={(v) => ph({ comorbidities: v })} placeholder="DM, CHF, COPD, CKD, malignancy…" /></div>
            <div><Label>Clinical Summary</Label><Textarea value={physician.clinicalSummary} onChange={(v) => ph({ clinicalSummary: v })} rows={4} placeholder="3–5 sentences: hospital course + current status" /></div>
            <div><Label>Follow-up Plan</Label><Textarea value={physician.followUpPlan} onChange={(v) => ph({ followUpPlan: v })} placeholder="Specialty + timeframe" /></div>
            <div><Label>Safety Flags / Critical Issues</Label><Textarea value={physician.safetyFlags} onChange={(v) => ph({ safetyFlags: v })} placeholder="Any safety concerns delaying discharge" /></div>
            <SaveButton onClick={() => saveRole("physician")} saving={saving} saved={savedTab === "physician"} />
          </>
        )}

        {/* ── NURSE ── */}
        {activeTab === "nurse" && (
          <>
            <Row>
              <div><Label>Education Readiness</Label>
                <Select value={nurse.educationReadiness} onChange={(v) => nu({ educationReadiness: v })}
                  options={[{value:"ready",label:"Ready"},{value:"conditional",label:"Conditional"},{value:"not_ready",label:"Not Ready"}]} />
              </div>
              <div><Label>Medication Complexity</Label>
                <Select value={nurse.medicationComplexity} onChange={(v) => nu({ medicationComplexity: v })}
                  options={[{value:"low",label:"Low"},{value:"moderate",label:"Moderate"},{value:"high",label:"High"},{value:"very_high",label:"Very High"}]} />
              </div>
            </Row>
            <div><Label>Education Barriers</Label><Textarea value={nurse.educationBarriers} onChange={(v) => nu({ educationBarriers: v })} placeholder="Language, literacy, cognitive, distress…" /></div>
            <Row>
              <div><Label>Injection at home?</Label><Toggle value={nurse.injectionRequired} onChange={(v) => nu({ injectionRequired: v })} yes="Yes — required" no="No" /></div>
              {nurse.injectionRequired && <div><Label>Injection education?</Label><Toggle value={nurse.injectionEducationDone} onChange={(v) => nu({ injectionEducationDone: v })} yes="Complete" no="Incomplete" /></div>}
            </Row>
            <div><Label>ADL Status</Label>
              <Select value={nurse.adlStatus} onChange={(v) => nu({ adlStatus: v })}
                options={[{value:"independent",label:"Independent"},{value:"minimal_assist",label:"Minimal Assist"},{value:"moderate_assist",label:"Moderate Assist"},{value:"max_assist",label:"Max Assist"},{value:"dependent",label:"Dependent"}]} />
            </div>
            <div><Label>ADL Concerns</Label><Textarea value={nurse.adlConcerns} onChange={(v) => nu({ adlConcerns: v })} placeholder="Bathing, dressing, transfers, continence, feeding" /></div>
            <div><Label>Caregiver identified?</Label><Toggle value={nurse.caregiverIdentified} onChange={(v) => nu({ caregiverIdentified: v })} yes="Yes" no="No caregiver" /></div>
            {nurse.caregiverIdentified && (
              <Row>
                <div><Label>Caregiver Name/Relation</Label><Input value={nurse.caregiverName} onChange={(v) => nu({ caregiverName: v })} placeholder="Spouse / Son / Home aide" /></div>
                <div><Label>Availability</Label><Input value={nurse.caregiverAvailability} onChange={(v) => nu({ caregiverAvailability: v })} placeholder="Full-time / Weekdays only…" /></div>
              </Row>
            )}
            <div><Label>Wound / Device Care</Label><Input value={nurse.woundCareNeeds} onChange={(v) => nu({ woundCareNeeds: v })} placeholder="Daily dressing, G-tube, catheter — or none" /></div>
            <div><Label>Warning Signs Educated</Label><Textarea value={nurse.warningSignsEducated} onChange={(v) => nu({ warningSignsEducated: v })} placeholder="Weight gain >2kg, glucose targets, signs of DKA…" /></div>
            <div><Label>Nursing Concerns</Label><Textarea value={nurse.concerns} onChange={(v) => nu({ concerns: v })} placeholder="Safety concerns, patient demeanor, follow-up worries" /></div>
            <SaveButton onClick={() => saveRole("nurse")} saving={saving} saved={savedTab === "nurse"} />
          </>
        )}

        {/* ── PHARMACIST ── */}
        {activeTab === "pharmacist" && (
          <>
            <Row>
              <div><Label>Reconciliation complete?</Label><Toggle value={pharmacist.reconciliationDone} onChange={(v) => rx({ reconciliationDone: v })} yes="Complete" no="Incomplete" /></div>
              <div><Label>Counseling complete?</Label><Toggle value={pharmacist.counselingDone} onChange={(v) => rx({ counselingDone: v })} yes="Complete" no="Incomplete" /></div>
            </Row>
            <div><Label>Drug Allergies</Label><Input value={pharmacist.allergies} onChange={(v) => rx({ allergies: v })} placeholder="Penicillin — rash, or NKDA" /></div>
            <div><Label>High-Risk Medications</Label><Textarea value={pharmacist.highRiskMeds} onChange={(v) => rx({ highRiskMeds: v })} placeholder="Warfarin, insulin, opioids, teratogens…" /></div>
            <div><Label>Drug Interactions</Label><Textarea value={pharmacist.drugInteractions} onChange={(v) => rx({ drugInteractions: v })} placeholder="e.g. warfarin + amoxicillin, or none" /></div>
            <div><Label>Medications to Stop at Discharge</Label><Textarea value={pharmacist.medsToStop} onChange={(v) => rx({ medsToStop: v })} placeholder="IV meds transitioning to oral, teratogens, etc." /></div>
            <div><Label>New Medications at Discharge</Label><Textarea value={pharmacist.newMeds} onChange={(v) => rx({ newMeds: v })} placeholder="New prescriptions" /></div>
            <Row>
              <div><Label>Insurance Coverage</Label>
                <Select value={pharmacist.insuranceCoverage} onChange={(v) => rx({ insuranceCoverage: v })}
                  options={[{value:"full",label:"Full"},{value:"partial",label:"Partial — copays/gaps"},{value:"none",label:"None / Uninsured"}]} />
              </div>
              <div><Label>Patient Understanding</Label>
                <Select value={pharmacist.patientUnderstanding} onChange={(v) => rx({ patientUnderstanding: v })}
                  options={[{value:"good",label:"Good"},{value:"partial",label:"Partial"},{value:"poor",label:"Poor"}]} />
              </div>
            </Row>
            <div><Label>Pharmacy Concerns</Label><Textarea value={pharmacist.concerns} onChange={(v) => rx({ concerns: v })} placeholder="Affordability, complex regimens, monitoring needed" /></div>
            <SaveButton onClick={() => saveRole("pharmacist")} saving={saving} saved={savedTab === "pharmacist"} />
          </>
        )}

        {/* ── SOCIAL WORKER ── */}
        {activeTab === "msw" && (
          <>
            <Row>
              <div><Label>Living Situation</Label>
                <Select value={msw.livingSituation} onChange={(v) => sw({ livingSituation: v })}
                  options={[{value:"alone",label:"Lives alone"},{value:"with_spouse",label:"With spouse/partner"},{value:"with_family",label:"With family"},{value:"assisted_living",label:"Assisted living"},{value:"nursing_home",label:"Nursing home"},{value:"homeless",label:"Homeless/unstable"}]} />
              </div>
              <div><Label>Insurance Status</Label>
                <Select value={msw.insurance} onChange={(v) => sw({ insurance: v })}
                  options={[{value:"insured",label:"Insured (private)"},{value:"medicare",label:"Medicare"},{value:"medicaid",label:"Medicaid"},{value:"medicaid_pending",label:"Medicaid pending"},{value:"dual",label:"Medicare + Medicaid"},{value:"uninsured",label:"Uninsured"}]} />
              </div>
            </Row>
            <Row>
              <div><Label>Support System</Label>
                <Select value={msw.supportSystem} onChange={(v) => sw({ supportSystem: v })}
                  options={[{value:"strong",label:"Strong"},{value:"moderate",label:"Moderate"},{value:"limited",label:"Limited"},{value:"none",label:"None — isolated"}]} />
              </div>
              <div><Label>Housing Stability</Label>
                <Select value={msw.housingStability} onChange={(v) => sw({ housingStability: v })}
                  options={[{value:"stable",label:"Stable"},{value:"at_risk",label:"At risk"},{value:"unstable",label:"Unstable"},{value:"homeless",label:"No housing"}]} />
              </div>
            </Row>
            <Row>
              <div><Label>Food Security</Label>
                <Select value={msw.foodSecurity} onChange={(v) => sw({ foodSecurity: v })}
                  options={[{value:"secure",label:"Food secure"},{value:"insecure",label:"Food insecure"}]} />
              </div>
              <div><Label>Transportation</Label><Toggle value={msw.transportationAccess} onChange={(v) => sw({ transportationAccess: v })} yes="Has reliable transport" no="Transportation barrier" /></div>
            </Row>
            <div><Label>Transportation Notes</Label><Input value={msw.transportationNotes} onChange={(v) => sw({ transportationNotes: v })} placeholder="Car, public transit, medical transport needed…" /></div>
            <div><Label>Financial Concerns</Label><Textarea value={msw.financialConcerns} onChange={(v) => sw({ financialConcerns: v })} placeholder="Medication cost, copays, lost income…" /></div>
            <div><Label>Mental Health Concerns</Label><Input value={msw.mentalHealthConcerns} onChange={(v) => sw({ mentalHealthConcerns: v })} placeholder="Depression, anxiety, PTSD — or none identified" /></div>
            <div><Label>Substance Use</Label><Input value={msw.substanceUse} onChange={(v) => sw({ substanceUse: v })} placeholder="Tobacco, alcohol, substances — or none reported" /></div>
            <div><Label>Community Resources Arranged</Label><Textarea value={msw.resourcesArranged} onChange={(v) => sw({ resourcesArranged: v })} placeholder="Home health, Meals on Wheels, patient assistance, food pantry…" /></div>
            <Row>
              <div><Label>Home health needed?</Label><Toggle value={msw.homeHealthNeeded} onChange={(v) => sw({ homeHealthNeeded: v })} yes="Yes — ordered" no="No" /></div>
              <div><Label>Follow-up arranged?</Label><Toggle value={msw.followUpArranged} onChange={(v) => sw({ followUpArranged: v })} yes="Yes — scheduled" no="Not yet" /></div>
            </Row>
            {msw.followUpArranged && <div><Label>Follow-up Details</Label><Input value={msw.followUpDetails} onChange={(v) => sw({ followUpDetails: v })} placeholder="Provider, date, location, transport?" /></div>}
            <div><Label>Social Work Concerns</Label><Textarea value={msw.concerns} onChange={(v) => sw({ concerns: v })} placeholder="Unresolved barriers, safety issues, escalation needed" /></div>
            <SaveButton onClick={() => saveRole("msw")} saving={saving} saved={savedTab === "msw"} />
          </>
        )}

        {/* ── PT ── */}
        {activeTab === "pt" && (
          <>
            <div><Label>Prior Functional Status (pre-admission)</Label><Textarea value={pt.priorFunctionalStatus} onChange={(v) => ptu({ priorFunctionalStatus: v })} placeholder="Fully independent, walking 1 mile/day — or uses walker at baseline…" /></div>
            <Row>
              <div><Label>Current Ambulation</Label>
                <Select value={pt.ambulation} onChange={(v) => ptu({ ambulation: v })}
                  options={[{value:"independent",label:"Independent"},{value:"supervised",label:"Supervised"},{value:"cane",label:"Cane"},{value:"walker",label:"Walker"},{value:"wheelchair",label:"Wheelchair (partial WB)"},{value:"wheelchair_full",label:"Wheelchair (non-ambulatory)"},{value:"bedbound",label:"Bedbound"}]} />
              </div>
              <div><Label>Transfer Status</Label>
                <Select value={pt.transferStatus} onChange={(v) => ptu({ transferStatus: v })}
                  options={[{value:"independent",label:"Independent"},{value:"supervised",label:"Supervised"},{value:"min_assist",label:"Min assist (25%)"},{value:"mod_assist",label:"Mod assist (50%)"},{value:"max_assist",label:"Max assist (75%)"},{value:"dependent",label:"Dependent (100%)"}]} />
              </div>
            </Row>
            <Row>
              <div><Label>Fall Risk</Label>
                <Select value={pt.fallRisk} onChange={(v) => ptu({ fallRisk: v })}
                  options={[{value:"low",label:"Low"},{value:"moderate",label:"Moderate"},{value:"high",label:"High"}]} />
              </div>
              <div><Label>Balance impaired?</Label><Toggle value={pt.balanceImpaired} onChange={(v) => ptu({ balanceImpaired: v })} yes="Yes — impaired" no="No — intact" /></div>
            </Row>
            <Row>
              <div><Label>Stairs at home?</Label><Toggle value={pt.stairsAtHome} onChange={(v) => ptu({ stairsAtHome: v })} yes="Yes" no="No stairs" /></div>
              {pt.stairsAtHome && <div><Label>Can manage stairs?</Label><Toggle value={pt.canManageStairs} onChange={(v) => ptu({ canManageStairs: v })} yes="Yes — cleared" no="No — barrier" /></div>}
            </Row>
            <div><Label>Equipment Needs</Label><Textarea value={pt.equipmentNeeds} onChange={(v) => ptu({ equipmentNeeds: v })} placeholder="Walker, grab bars, shower chair, commode — or none" /></div>
            <Row>
              <div><Label>PT / OT Referral</Label>
                <Select value={pt.ptReferral} onChange={(v) => ptu({ ptReferral: v })}
                  options={[{value:"none",label:"None needed"},{value:"outpatient_pt",label:"Outpatient PT"},{value:"home_pt",label:"Home PT"},{value:"outpatient_ot",label:"Outpatient OT"},{value:"home_ot",label:"Home OT"},{value:"both_pt_ot",label:"PT + OT"}]} />
              </div>
              <div><Label>Rehab facility needed?</Label><Toggle value={pt.rehabNeeded} onChange={(v) => ptu({ rehabNeeded: v })} yes="Yes — SNF/IRF" no="No — home" /></div>
            </Row>
            <div><Label>PT Concerns</Label><Textarea value={pt.concerns} onChange={(v) => ptu({ concerns: v })} placeholder="Safety concerns, equipment delays, caregiver training…" /></div>
            <SaveButton onClick={() => saveRole("pt")} saving={saving} saved={savedTab === "pt"} />
          </>
        )}
      </div>

      {/* Synthesis footer */}
      <div className="mt-5 bg-panel border border-border-subtle rounded-sm p-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-mono text-text-secondary">
            Roles saved:{" "}
            <span className={done.length >= 1 ? "text-ok-text" : "text-warning-text"}>
              {done.length} / 5
            </span>
            <span className="text-text-tertiary ml-2">({done.map((r) => ROLE_ABBREV[r]).join(", ") || "none yet"})</span>
          </div>
          <div className="text-2xs text-text-tertiary mt-0.5">
            Any role can run synthesis. More roles = better analysis.
          </div>
        </div>
        <button
          onClick={handleSynthesize}
          disabled={synthesizing || done.length === 0}
          className={`px-6 py-2.5 rounded-sm font-mono text-sm font-semibold transition-colors ${
            done.length > 0 && !synthesizing
              ? "bg-accent text-white hover:bg-accent/80"
              : "bg-card text-text-tertiary border border-border-subtle cursor-not-allowed"
          }`}
        >
          {synthesizing ? "Running synthesis…" : "Run AI Synthesis →"}
        </button>
      </div>
    </div>
  );
}
