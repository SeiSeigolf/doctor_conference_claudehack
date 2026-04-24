"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPatient, PatientRecord, ROLE_KEYS, ROLE_LABELS, ROLE_ABBREV } from "../../lib/patientStore";
import { PatientBanner } from "../../components/PatientBanner";
import { FindingRow } from "../../components/FindingRow";
import { priorityToSeverity } from "../../components/StatusPill";

type AnyRecord = Record<string, unknown>;
type SectionId =
  | "overview" | "problems" | "medications" | "vitals"
  | "nursing" | "pharmacy" | "socialwork" | "pt"
  | "discharge" | "handoff";

const CHART_SECTIONS: { id: SectionId; label: string; abbrev: string }[] = [
  { id: "overview",    label: "Chart Overview",   abbrev: "OVR" },
  { id: "problems",    label: "Problem List",      abbrev: "Dx"  },
  { id: "medications", label: "Medications",       abbrev: "Rx"  },
  { id: "vitals",      label: "Labs & Vitals",     abbrev: "LAB" },
  { id: "nursing",     label: "Nursing",           abbrev: "RN"  },
  { id: "pharmacy",    label: "Pharmacy",          abbrev: "RPh" },
  { id: "socialwork",  label: "Social Work",       abbrev: "MSW" },
  { id: "pt",          label: "PT / OT",           abbrev: "PT"  },
  { id: "discharge",   label: "Discharge Plan",    abbrev: "DC"  },
  { id: "handoff",     label: "Handoff Packages",  abbrev: "HO"  },
];

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-2 border-b border-[#1e3a5f]">
      <div className="h-4 w-1 bg-[#1e56a0] rounded-full flex-shrink-0" />
      <h2 className="font-mono font-bold text-sm text-white uppercase tracking-wide">{title}</h2>
      {count !== undefined && (
        <span className="text-2xs font-mono text-[#4a6b8a]">({count})</span>
      )}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value?: string | boolean | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-3 py-1.5 border-b border-border-subtle/30 last:border-0">
      <span className="text-2xs font-mono text-[#4a6b8a] uppercase w-44 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-xs font-mono text-text-primary">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
      </span>
    </div>
  );
}

function PendingSection({ id }: { id: string }) {
  return (
    <p className="text-sm font-mono text-text-tertiary">
      Assessment not yet entered.{" "}
      <Link href={`/intake/${id}`} className="text-[#5b9bd5] hover:underline">
        Add now →
      </Link>
    </p>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<AnyRecord | null>(null);
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [section, setSection] = useState<SectionId>("overview");

  useEffect(() => {
    const raw = localStorage.getItem(`rounds_synthesis_${id}`);
    if (raw) setD(JSON.parse(raw));
    setPatient(getPatient(id));
    setLoaded(true);
  }, [id]);

  if (!loaded) {
    return (
      <div className="py-20 text-center">
        <span className="text-2xs font-mono text-text-tertiary animate-pulse">LOADING CHART…</span>
      </div>
    );
  }

  if (!patient && !d) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">
          PATIENT NOT FOUND
        </div>
        <p className="text-sm text-text-secondary">
          No record found. It may have been cleared from browser storage.
        </p>
        <Link href="/" className="text-[#5b9bd5] text-sm font-mono hover:underline">
          ← Return to patient list
        </Link>
      </div>
    );
  }

  // ── In-progress: no synthesis yet ──────────────────────────────────────────
  if (!d && patient) {
    const completedRoles = ROLE_KEYS.filter((k) => patient[k] !== null);
    return (
      <div className="-mx-6 -mt-6">
        <PatientBanner patient={patient} synth={null} />
        <div className="max-w-2xl mx-auto py-8 px-6 space-y-5">
          <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded p-5">
            <div className="text-2xs font-mono uppercase tracking-widest text-[#4a6b8a] mb-1">
              CHART STATUS
            </div>
            <p className="text-sm font-mono text-[#a8c4e0]">
              AI synthesis not yet run.{" "}
              {completedRoles.length} of 5 roles have entered data.
            </p>
          </div>

          <div className="bg-panel border border-border-subtle rounded overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#1e3a5f] bg-[#0d1b2a] flex items-center gap-2">
              <div className="h-3 w-0.5 bg-[#1e56a0] rounded-full" />
              <span className="text-2xs font-mono uppercase tracking-widest text-[#7bafd4]">
                CARE TEAM DOCUMENTATION
              </span>
            </div>
            {ROLE_KEYS.map((role) => {
              const done = patient[role] !== null;
              const roleData = patient[role] as AnyRecord | null;
              return (
                <div
                  key={role}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle/50 last:border-0"
                >
                  <span
                    className={`text-2xs font-mono w-10 text-center px-1 py-0.5 rounded border ${
                      done
                        ? "border-ok-border text-ok-text bg-ok-bg"
                        : "border-border-subtle text-text-tertiary"
                    }`}
                  >
                    {ROLE_ABBREV[role]}
                  </span>
                  <span className="text-xs font-mono text-text-primary flex-1">
                    {ROLE_LABELS[role]}
                  </span>
                  {done ? (
                    <span className="text-2xs font-mono text-ok-text">
                      Documented{" "}
                      {roleData?.savedAt
                        ? new Date(roleData.savedAt as string).toLocaleTimeString()
                        : ""}
                    </span>
                  ) : (
                    <span className="text-2xs font-mono text-text-tertiary">Pending</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Link
              href={`/intake/${id}`}
              className="flex-1 text-center py-2.5 bg-[#1e3a5f] border border-[#1e56a0] text-[#5b9bd5] font-mono text-sm rounded hover:bg-[#1e56a0]/30 transition-colors"
            >
              {completedRoles.length === 0
                ? "Begin Documentation →"
                : `Continue Intake (${completedRoles.length}/5) →`}
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 border border-border-subtle text-text-secondary font-mono text-sm rounded hover:border-border-hover transition-colors"
            >
              ← List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Full chart view with synthesis ─────────────────────────────────────────
  const ph = patient?.physician as AnyRecord | null;
  const rn = patient?.nurse as AnyRecord | null;
  const rx = patient?.pharmacist as AnyRecord | null;
  const sw = patient?.msw as AnyRecord | null;
  const ptData = patient?.pt as AnyRecord | null;

  const allActions = (d!.prioritized_actions ?? []) as AnyRecord[];
  const criticalActions = allActions.filter((a) => a.priority === "CRITICAL");

  const sectionsWithData = new Set<string>(["overview", "discharge"]);
  if (ph) { sectionsWithData.add("problems"); sectionsWithData.add("medications"); sectionsWithData.add("vitals"); }
  if (rn) sectionsWithData.add("nursing");
  if (rx) sectionsWithData.add("pharmacy");
  if (sw) sectionsWithData.add("socialwork");
  if (ptData) sectionsWithData.add("pt");
  if ((d!.handoff_packages as AnyRecord | undefined)?.patient_instructions) sectionsWithData.add("handoff");

  return (
    <div className="-mx-6 -mt-6">
      <PatientBanner patient={patient!} synth={d} />

      <div className="flex" style={{ minHeight: "calc(100vh - 110px)" }}>
        {/* ── Epic-style left sidebar ── */}
        <aside className="w-48 bg-[#070d14] border-r border-[#1e3a5f] flex-shrink-0 overflow-y-auto">
          <div className="py-2">
            <div className="px-3 pt-3 pb-2 text-2xs font-mono uppercase tracking-widest text-[#4a6b8a]">
              Chart Activities
            </div>
            {CHART_SECTIONS.map((s) => {
              const isActive = section === s.id;
              const hasData = sectionsWithData.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors border-l-2 ${
                    isActive
                      ? "bg-[#1e3a5f] text-white border-[#1e56a0]"
                      : "text-[#7bafd4] hover:bg-[#0d1b2a] border-transparent"
                  }`}
                >
                  <span
                    className={`text-2xs font-mono w-8 flex-shrink-0 ${
                      hasData
                        ? isActive ? "text-white" : "text-[#5b9bd5]"
                        : "text-[#2a4a6a]"
                    }`}
                  >
                    {s.abbrev}
                  </span>
                  <span className="text-xs font-mono flex-1">{s.label}</span>
                  {hasData && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1e56a0] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Main content area ── */}
        <main className="flex-1 overflow-y-auto p-6 bg-base">

          {/* OVERVIEW */}
          {section === "overview" && (
            <div className="space-y-5 max-w-3xl">
              <SectionHeader title="Chart Overview" />

              {/* Key metric cards */}
              {(() => {
                const readiness = String(d!.discharge_readiness ?? "");
                const laceTotal = (d!.lace_score as AnyRecord)?.total;
                const risk = (d!.readmission_risk_30d as AnyRecord)?.score_pct;
                const cards = [
                  {
                    label: "Discharge Status",
                    value: readiness === "ready" ? "READY" : readiness === "conditional" ? "CONDITIONAL" : "NOT READY",
                    cls: readiness === "ready" ? "text-ok-text" : readiness === "conditional" ? "text-warning-text" : "text-critical-text",
                  },
                  { label: "LACE Score", value: laceTotal !== undefined ? String(laceTotal) : "—", cls: "text-warning-text" },
                  { label: "30-Day Readmission Risk", value: risk !== undefined ? `${String(risk)}%` : "—", cls: "text-warning-text" },
                ];
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {cards.map((card) => (
                      <div key={card.label} className="bg-[#0d1b2a] border border-[#1e3a5f] rounded p-4">
                        <div className="text-2xs font-mono text-[#4a6b8a] uppercase tracking-widest mb-1">{card.label}</div>
                        <div className={`font-mono font-bold text-2xl tabular-nums ${card.cls}`}>{card.value}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Rationale */}
              {!!d!.discharge_readiness_rationale && (
                <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded p-4">
                  <div className="text-2xs font-mono uppercase tracking-widest text-[#4a6b8a] mb-2">
                    Discharge Readiness Rationale
                  </div>
                  <p className="text-sm font-mono text-[#a8c4e0] leading-relaxed">
                    {String(d!.discharge_readiness_rationale)}
                  </p>
                </div>
              )}

              {/* Critical actions */}
              {criticalActions.length > 0 && (
                <div>
                  <div className="text-2xs font-mono uppercase tracking-widest text-critical-text mb-2">
                    Critical Actions Required ({criticalActions.length})
                  </div>
                  <div className="border border-critical-border/40 rounded overflow-hidden">
                    {criticalActions.map((a, i) => (
                      <FindingRow
                        key={i}
                        severity="critical"
                        label="CRITICAL"
                        description={a.action as string}
                        source={a.owner as string}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick nav hints */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {CHART_SECTIONS.filter((s) => s.id !== "overview").map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    className={`text-left px-3 py-2 rounded border flex items-center gap-2 transition-colors ${
                      sectionsWithData.has(s.id)
                        ? "border-[#1e3a5f] bg-[#0d1b2a] hover:bg-[#1e3a5f]/40 text-[#7bafd4]"
                        : "border-border-subtle/30 text-text-tertiary"
                    }`}
                  >
                    <span className="text-2xs font-mono w-8 text-[#4a6b8a]">{s.abbrev}</span>
                    <span className="text-xs font-mono">{s.label}</span>
                    {sectionsWithData.has(s.id) && (
                      <span className="ml-auto text-2xs text-ok-text">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PROBLEM LIST */}
          {section === "problems" && (
            <div className="space-y-4 max-w-3xl">
              <SectionHeader title="Problem List" />
              {ph ? (
                <>
                  <div className="bg-panel border border-border-subtle rounded overflow-hidden">
                    <div className="px-4 py-2 bg-[#0d1b2a] border-b border-[#1e3a5f] flex items-center gap-2">
                      <span className="text-2xs font-mono text-[#5b9bd5] uppercase">Primary Dx</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="font-mono text-sm text-text-primary font-semibold">
                        {ph.primaryDx as string || "—"}
                      </span>
                    </div>
                  </div>

                  {(ph.secondaryDx as string[])?.filter(Boolean).length > 0 && (
                    <div className="bg-panel border border-border-subtle rounded overflow-hidden">
                      <div className="px-4 py-2 bg-[#0d1b2a] border-b border-[#1e3a5f]">
                        <span className="text-2xs font-mono text-[#5b9bd5] uppercase">Secondary Diagnoses</span>
                      </div>
                      <div className="divide-y divide-border-subtle/50">
                        {(ph.secondaryDx as string[]).filter(Boolean).map((dx, i) => (
                          <div key={i} className="px-4 py-2 flex items-center gap-3">
                            <span className="text-2xs font-mono text-[#4a6b8a] w-5">{i + 1}.</span>
                            <span className="text-sm font-mono text-text-primary">{dx}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <DataRow label="Comorbidities" value={ph.comorbidities as string} />
                  {ph.clinicalSummary && (
                    <div className="bg-panel border border-border-subtle rounded p-4">
                      <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">Clinical Summary</div>
                      <p className="text-sm font-mono text-text-primary leading-relaxed whitespace-pre-wrap">
                        {ph.clinicalSummary as string}
                      </p>
                    </div>
                  )}
                  <DataRow label="Follow-up Plan" value={ph.followUpPlan as string} />
                  <DataRow label="Safety Flags" value={ph.safetyFlags as string} />
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* MEDICATIONS */}
          {section === "medications" && (
            <div className="space-y-4 max-w-3xl">
              <SectionHeader title="Medications" />
              {ph ? (
                <>
                  <div className="bg-panel border border-border-subtle rounded p-4">
                    <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">Current Medication List</div>
                    <p className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                      {ph.medications as string || "—"}
                    </p>
                  </div>

                  {rx && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-panel border border-border-subtle rounded p-4">
                          <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">
                            Reconciliation
                          </div>
                          <span
                            className={`text-2xs font-mono px-2 py-0.5 rounded border ${
                              rx.reconciliationDone
                                ? "border-ok-border text-ok-text bg-ok-bg"
                                : "border-warning-border text-warning-text bg-warning-bg"
                            }`}
                          >
                            {rx.reconciliationDone ? "COMPLETE" : "PENDING"}
                          </span>
                        </div>
                        <div className="bg-panel border border-border-subtle rounded p-4">
                          <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">
                            Patient Counseling
                          </div>
                          <span
                            className={`text-2xs font-mono px-2 py-0.5 rounded border ${
                              rx.counselingDone
                                ? "border-ok-border text-ok-text bg-ok-bg"
                                : "border-warning-border text-warning-text bg-warning-bg"
                            }`}
                          >
                            {rx.counselingDone ? "DONE" : "PENDING"}
                          </span>
                        </div>
                      </div>

                      {rx.highRiskMeds && (
                        <div className="bg-critical-bg border border-critical-border rounded p-4">
                          <div className="text-2xs font-mono text-critical-text uppercase mb-1">
                            High-Risk Medications
                          </div>
                          <p className="text-sm font-mono text-text-primary">{rx.highRiskMeds as string}</p>
                        </div>
                      )}
                      {rx.drugInteractions && (
                        <div className="bg-warning-bg border border-warning-border rounded p-4">
                          <div className="text-2xs font-mono text-warning-text uppercase mb-1">
                            Drug Interactions
                          </div>
                          <p className="text-sm font-mono text-text-primary">{rx.drugInteractions as string}</p>
                        </div>
                      )}
                      <DataRow label="Meds to Discontinue" value={rx.medsToStop as string} />
                      <DataRow label="New Meds at Discharge" value={rx.newMeds as string} />
                      <DataRow label="Allergies / ADRs" value={rx.allergies as string} />
                      <DataRow label="Insurance Coverage" value={rx.insuranceCoverage as string} />
                      <DataRow label="Patient Understanding" value={rx.patientUnderstanding as string} />
                    </>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* LABS & VITALS */}
          {section === "vitals" && (
            <div className="space-y-4 max-w-3xl">
              <SectionHeader title="Labs & Vitals" />
              {ph ? (
                <>
                  <div className="bg-panel border border-border-subtle rounded overflow-hidden">
                    <div className="px-4 py-2 bg-[#0d1b2a] border-b border-[#1e3a5f]">
                      <span className="text-2xs font-mono text-[#5b9bd5] uppercase">Current Vitals</span>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-border-subtle">
                      {[
                        { label: "Blood Pressure", value: ph.currentBp as string, unit: "mmHg" },
                        { label: "Heart Rate", value: ph.currentHr as string, unit: "bpm" },
                        { label: "SpO₂", value: ph.currentSpo2 as string, unit: "%" },
                      ].map(({ label, value, unit }) => (
                        <div key={label} className="px-4 py-4 text-center">
                          <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-1">{label}</div>
                          <div className="font-mono text-2xl font-bold text-text-primary tabular-nums">
                            {value || "—"}
                          </div>
                          {value && (
                            <div className="text-2xs font-mono text-[#4a6b8a] mt-0.5">{unit}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {ph.keyLabs && (
                    <div className="bg-panel border border-border-subtle rounded p-4">
                      <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">Key Labs</div>
                      <p className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                        {ph.keyLabs as string}
                      </p>
                    </div>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* NURSING */}
          {section === "nursing" && (
            <div className="space-y-1 max-w-3xl">
              <SectionHeader title="Nursing Assessment" />
              {rn ? (
                <>
                  <DataRow label="Education Readiness" value={rn.educationReadiness as string} />
                  <DataRow label="Education Barriers" value={rn.educationBarriers as string} />
                  <DataRow label="Medication Complexity" value={rn.medicationComplexity as string} />
                  <DataRow label="Injection Required" value={rn.injectionRequired as boolean} />
                  <DataRow label="Injection Ed. Done" value={rn.injectionEducationDone as boolean} />
                  <DataRow label="ADL Status" value={rn.adlStatus as string} />
                  <DataRow label="ADL Concerns" value={rn.adlConcerns as string} />
                  <DataRow label="Caregiver Identified" value={rn.caregiverIdentified as boolean} />
                  {rn.caregiverIdentified && (
                    <>
                      <DataRow label="Caregiver Name" value={rn.caregiverName as string} />
                      <DataRow label="Caregiver Availability" value={rn.caregiverAvailability as string} />
                    </>
                  )}
                  <DataRow label="Wound Care Needs" value={rn.woundCareNeeds as string} />
                  <DataRow label="Warning Signs Educated" value={rn.warningSignsEducated as string} />
                  {rn.concerns && (
                    <div className="bg-warning-bg border border-warning-border rounded p-3 mt-3">
                      <div className="text-2xs font-mono text-warning-text uppercase mb-1">Nursing Concerns</div>
                      <p className="text-sm font-mono text-text-primary">{rn.concerns as string}</p>
                    </div>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* PHARMACY */}
          {section === "pharmacy" && (
            <div className="space-y-1 max-w-3xl">
              <SectionHeader title="Pharmacy Assessment" />
              {rx ? (
                <>
                  <DataRow label="Reconciliation Done" value={rx.reconciliationDone as boolean} />
                  <DataRow label="High-Risk Meds" value={rx.highRiskMeds as string} />
                  <DataRow label="Drug Interactions" value={rx.drugInteractions as string} />
                  <DataRow label="Meds to Discontinue" value={rx.medsToStop as string} />
                  <DataRow label="New Meds at Discharge" value={rx.newMeds as string} />
                  <DataRow label="Allergies / ADRs" value={rx.allergies as string} />
                  <DataRow label="Insurance Coverage" value={rx.insuranceCoverage as string} />
                  <DataRow label="Patient Understanding" value={rx.patientUnderstanding as string} />
                  <DataRow label="Counseling Done" value={rx.counselingDone as boolean} />
                  {rx.concerns && (
                    <div className="bg-warning-bg border border-warning-border rounded p-3 mt-3">
                      <div className="text-2xs font-mono text-warning-text uppercase mb-1">Pharmacy Concerns</div>
                      <p className="text-sm font-mono text-text-primary">{rx.concerns as string}</p>
                    </div>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* SOCIAL WORK */}
          {section === "socialwork" && (
            <div className="space-y-1 max-w-3xl">
              <SectionHeader title="Social Work Assessment" />
              {sw ? (
                <>
                  <DataRow label="Living Situation" value={sw.livingSituation as string} />
                  <DataRow label="Insurance" value={sw.insurance as string} />
                  <DataRow label="Support System" value={sw.supportSystem as string} />
                  <DataRow label="Transportation" value={sw.transportationAccess as boolean} />
                  <DataRow label="Transportation Notes" value={sw.transportationNotes as string} />
                  <DataRow label="Housing Stability" value={sw.housingStability as string} />
                  <DataRow label="Food Security" value={sw.foodSecurity as string} />
                  <DataRow label="Financial Concerns" value={sw.financialConcerns as string} />
                  <DataRow label="Mental Health" value={sw.mentalHealthConcerns as string} />
                  <DataRow label="Substance Use" value={sw.substanceUse as string} />
                  <DataRow label="Resources Arranged" value={sw.resourcesArranged as string} />
                  <DataRow label="Home Health Needed" value={sw.homeHealthNeeded as boolean} />
                  <DataRow label="Follow-up Arranged" value={sw.followUpArranged as boolean} />
                  <DataRow label="Follow-up Details" value={sw.followUpDetails as string} />
                  {sw.concerns && (
                    <div className="bg-warning-bg border border-warning-border rounded p-3 mt-3">
                      <div className="text-2xs font-mono text-warning-text uppercase mb-1">Social Work Concerns</div>
                      <p className="text-sm font-mono text-text-primary">{sw.concerns as string}</p>
                    </div>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* PT / OT */}
          {section === "pt" && (
            <div className="space-y-1 max-w-3xl">
              <SectionHeader title="Physical Therapy Assessment" />
              {ptData ? (
                <>
                  <DataRow label="Prior Functional Status" value={ptData.priorFunctionalStatus as string} />
                  <DataRow label="Ambulation" value={ptData.ambulation as string} />
                  <DataRow label="Transfer Status" value={ptData.transferStatus as string} />
                  <DataRow label="Fall Risk" value={ptData.fallRisk as string} />
                  <DataRow label="Balance Impaired" value={ptData.balanceImpaired as boolean} />
                  <DataRow label="Stairs at Home" value={ptData.stairsAtHome as boolean} />
                  <DataRow label="Can Manage Stairs" value={ptData.canManageStairs as boolean} />
                  <DataRow label="Equipment Needs" value={ptData.equipmentNeeds as string} />
                  <DataRow label="PT Referral" value={ptData.ptReferral as string} />
                  <DataRow label="Rehab Facility Needed" value={ptData.rehabNeeded as boolean} />
                  {ptData.concerns && (
                    <div className="bg-warning-bg border border-warning-border rounded p-3 mt-3">
                      <div className="text-2xs font-mono text-warning-text uppercase mb-1">PT Concerns</div>
                      <p className="text-sm font-mono text-text-primary">{ptData.concerns as string}</p>
                    </div>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* DISCHARGE PLAN */}
          {section === "discharge" && (
            <div className="space-y-5 max-w-3xl">
              <SectionHeader title="Discharge Planning" count={allActions.length} />

              {((d!.conflicts ?? []) as AnyRecord[]).length > 0 && (
                <div>
                  <div className="text-2xs font-mono uppercase tracking-widest text-warning-text mb-2">
                    Clinical Conflicts
                  </div>
                  <div className="border border-border-subtle rounded overflow-hidden">
                    {((d!.conflicts ?? []) as AnyRecord[]).map((c, i) => (
                      <FindingRow
                        key={i}
                        severity="warning"
                        label="CONFLICT"
                        description={c.summary as string}
                        source={(c.positions as AnyRecord[])?.map((p) => p.holder).join(" · ")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {((d!.gaps ?? []) as AnyRecord[]).length > 0 && (
                <div>
                  <div className="text-2xs font-mono uppercase tracking-widest text-[#5b9bd5] mb-2">
                    Documentation Gaps
                  </div>
                  <div className="border border-border-subtle rounded overflow-hidden">
                    {((d!.gaps ?? []) as AnyRecord[]).map((g, i) => (
                      <FindingRow
                        key={i}
                        severity="moderate"
                        label="GAP"
                        description={g.summary as string}
                        source={g.owner as string}
                      />
                    ))}
                  </div>
                </div>
              )}

              {allActions.length > 0 && (
                <div>
                  <div className="text-2xs font-mono uppercase tracking-widest text-[#4a6b8a] mb-2">
                    Prioritized Action Items
                  </div>
                  <div className="border border-border-subtle rounded overflow-hidden">
                    {allActions.map((a, i) => (
                      <FindingRow
                        key={i}
                        severity={priorityToSeverity(a.priority as string)}
                        label={a.priority as string}
                        description={a.action as string}
                        source={a.owner as string}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!!ph?.followUpPlan && (
                <div className="bg-panel border border-border-subtle rounded p-4">
                  <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">Follow-up Plan</div>
                  <p className="text-sm font-mono text-text-primary leading-relaxed">
                    {String(ph.followUpPlan)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* HANDOFF PACKAGES */}
          {section === "handoff" && (
            <div className="space-y-5 max-w-3xl">
              <SectionHeader title="Handoff Packages" />

              {(d!.conference_agenda as AnyRecord[])?.length > 0 && (
                <div className="bg-panel border border-border-subtle rounded overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#1e3a5f] bg-[#0d1b2a] flex items-center gap-2">
                    <div className="h-3 w-0.5 bg-[#1e56a0] rounded-full" />
                    <span className="text-2xs font-mono uppercase text-[#7bafd4]">
                      Conference Agenda
                    </span>
                  </div>
                  {(d!.conference_agenda as AnyRecord[]).map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 px-4 py-2.5 border-b border-border-subtle/50 last:border-0"
                    >
                      <span className="font-mono text-2xs text-[#4a6b8a] w-8 flex-shrink-0 pt-0.5">
                        {item.time_minutes as number}m
                      </span>
                      <div>
                        <span className="text-xs text-[#5b9bd5] font-mono">
                          {item.presenting_role as string}
                        </span>
                        <span className="text-xs text-text-primary"> — {item.agenda_item as string}</span>
                        {!!item.key_question && (
                          <p className="text-2xs text-text-secondary mt-0.5 italic">
                            {String(item.key_question)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!!(d!.handoff_packages as AnyRecord | undefined)?.patient_instructions && (
                <div className="bg-panel border border-border-subtle rounded p-4">
                  <div className="text-2xs font-mono uppercase text-[#4a6b8a] mb-3">
                    Patient Discharge Instructions
                  </div>
                  <p className="text-sm font-mono text-text-primary leading-relaxed whitespace-pre-wrap">
                    {String((d!.handoff_packages as AnyRecord).patient_instructions)}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-2xs font-mono text-[#4a6b8a] pt-2 border-t border-border-subtle">
                <span>Model: {(d!.meta as AnyRecord | undefined)?.model as string ?? "claude-opus-4-7"}</span>
                <span>Confidence: {(d!.meta as AnyRecord | undefined)?.synthesis_confidence as string}</span>
                <span>
                  Synthesized:{" "}
                  {d!.synthesis_timestamp
                    ? new Date(d!.synthesis_timestamp as string).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
          )}

          {/* Bottom nav */}
          <div className="flex gap-4 mt-10 pt-4 border-t border-border-subtle">
            <Link href="/" className="text-[#5b9bd5] font-mono text-xs hover:underline">
              ← Patient List
            </Link>
            <Link href={`/intake/${id}`} className="text-[#5b9bd5] font-mono text-xs hover:underline">
              Edit Chart →
            </Link>
            <Link href="/intake" className="text-[#5b9bd5] font-mono text-xs hover:underline">
              + New Patient
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
