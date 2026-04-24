"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StatusPill, readinessToSeverity, laceTierToSeverity, priorityToSeverity } from "../../components/StatusPill";
import { MetricDisplay } from "../../components/MetricDisplay";
import { FindingRow } from "../../components/FindingRow";
import { getPatient, PatientRecord, ROLE_KEYS, ROLE_LABELS, ROLE_ABBREV } from "../../lib/patientStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnyRecord | null>(null);
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(`rounds_synthesis_${id}`);
    if (raw) setData(JSON.parse(raw));
    const rec = getPatient(id);
    setPatient(rec);
    setLoaded(true);
  }, [id]);

  if (!loaded) {
    return (
      <div className="py-20 text-center">
        <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary animate-pulse">LOADING…</div>
      </div>
    );
  }

  // Patient not in localStorage at all
  if (!patient && !data) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-2">PATIENT NOT FOUND</div>
        <p className="text-sm text-text-secondary mb-4">No patient record found for this ID. It may have been cleared from browser storage.</p>
        <Link href="/" className="text-info-text text-sm font-mono hover:underline">← Return to case list</Link>
      </div>
    );
  }

  // Patient exists but no synthesis yet — show intake progress
  if (!data && patient) {
    const completedRoles = ROLE_KEYS.filter((k) => patient[k] !== null);
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="bg-panel border border-border-subtle rounded-sm p-5">
          <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">INTAKE IN PROGRESS</div>
          <h1 className="text-xl font-mono font-semibold text-text-primary mb-1">{patient.basic.name || "Unnamed Patient"}</h1>
          <p className="text-xs text-text-secondary">
            {patient.basic.age && `${patient.basic.age}${patient.basic.sex} · `}
            {patient.basic.chiefComplaint || "No chief complaint entered"}
          </p>
        </div>

        <div className="bg-panel border border-border-subtle rounded-sm overflow-hidden">
          <div className="px-4 py-2 border-b border-border-subtle">
            <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">Role Completion</span>
          </div>
          {ROLE_KEYS.map((role) => {
            const done = patient[role] !== null;
            const roleData = patient[role] as AnyRecord | null;
            return (
              <div key={role} className="flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle/50 last:border-0">
                <span className={`text-2xs font-mono px-1.5 py-0.5 rounded-sm border w-10 text-center ${
                  done ? "border-ok-border text-ok-text bg-ok-bg" : "border-border-subtle text-text-tertiary"
                }`}>
                  {ROLE_ABBREV[role]}
                </span>
                <span className="text-xs font-mono text-text-primary flex-1">{ROLE_LABELS[role]}</span>
                {done ? (
                  <span className="text-2xs font-mono text-ok-text">
                    Saved {roleData?.savedAt ? new Date(roleData.savedAt).toLocaleTimeString() : ""}
                  </span>
                ) : (
                  <span className="text-2xs font-mono text-text-tertiary">Not entered</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Link
            href={`/intake/${id}`}
            className="flex-1 text-center py-2.5 bg-accent-bg border border-accent-border text-accent-text font-mono text-sm rounded-sm hover:bg-accent/20 transition-colors"
          >
            {completedRoles.length === 0 ? "Start Intake →" : `Continue Intake (${completedRoles.length}/5 roles) →`}
          </Link>
          <Link href="/" className="px-4 py-2.5 border border-border-subtle text-text-secondary font-mono text-sm rounded-sm hover:border-border-hover transition-colors">
            ← List
          </Link>
        </div>
      </div>
    );
  }

  // At this point data is guaranteed non-null (both !data && !patient and !data && patient cases returned above)
  const d = data!;
  const readiness = d.discharge_readiness ?? "not_ready";
  const lace = d.lace_score ?? {};
  const risk30d = d.readmission_risk_30d ?? {};
  const criticalActions = (d.prioritized_actions ?? []).filter((a: AnyRecord) => a.priority === "CRITICAL");
  const otherActions = (d.prioritized_actions ?? []).filter((a: AnyRecord) => a.priority !== "CRITICAL");

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {/* Header */}
      <div className="bg-panel border border-border-subtle rounded-sm p-4 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">USER-ENTERED PATIENT · SYNTHESIS COMPLETE</div>
          <h1 className="text-xl font-mono font-semibold text-text-primary">{d.patient_name ?? "Patient"}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusPill severity={readinessToSeverity(readiness)} label={readiness === "not_ready" ? "NOT READY" : readiness === "conditional" ? "CONDITIONAL" : "READY"} dot />
            {lace.tier && <StatusPill severity={laceTierToSeverity(lace.tier)} label={`LACE ${lace.total} · ${lace.tier?.replace("_"," ")}`} />}
          </div>
        </div>
        <div className="flex gap-6">
          {lace.total !== undefined && <MetricDisplay value={lace.total} label="LACE Score" sublabel={lace.tier?.replace("_"," ")} severity={laceTierToSeverity(lace.tier ?? "LOW")} size="md" />}
          {risk30d.score_pct !== undefined && <MetricDisplay value={`${risk30d.score_pct}%`} label="30-Day Risk" sublabel="Readmission" severity={risk30d.score_pct > 25 ? "critical" : risk30d.score_pct > 15 ? "warning" : "ok"} size="md" />}
        </div>
      </div>

      {/* Rationale */}
      {d.discharge_readiness_rationale && (
        <div className="bg-critical-bg border border-critical-border rounded-sm px-4 py-3">
          <span className="text-2xs font-mono uppercase tracking-widest text-critical-text">Discharge Hold Rationale </span>
          <p className="text-xs text-text-primary mt-1 leading-relaxed">{d.discharge_readiness_rationale}</p>
        </div>
      )}

      {/* Findings feed */}
      <div className="bg-panel border border-border-subtle rounded-sm overflow-hidden">
        <div className="px-4 py-2 border-b border-border-subtle">
          <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">Live Findings</span>
        </div>
        {criticalActions.slice(0, 6).map((a: AnyRecord, i: number) => (
          <FindingRow key={i} severity={priorityToSeverity(a.priority)} label={a.priority} description={a.action} source={a.owner} />
        ))}
        {(d.conflicts ?? []).slice(0, 3).map((c: AnyRecord, i: number) => (
          <FindingRow key={`c${i}`} severity="warning" label="CONFLICT" description={c.summary} source={c.positions?.map((p: AnyRecord) => p.holder).join(" · ")} />
        ))}
        {(d.gaps ?? []).slice(0, 4).map((g: AnyRecord, i: number) => (
          <FindingRow key={`g${i}`} severity="moderate" label="GAP" description={g.summary} source={g.owner} />
        ))}
      </div>

      {/* All actions */}
      {otherActions.length > 0 && (
        <div className="bg-panel border border-border-subtle rounded-sm overflow-hidden">
          <div className="px-4 py-2 border-b border-border-subtle flex items-center justify-between">
            <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">Additional Actions</span>
            <span className="text-2xs font-mono text-text-tertiary">{otherActions.length}</span>
          </div>
          {otherActions.map((a: AnyRecord, i: number) => (
            <FindingRow key={i} severity={priorityToSeverity(a.priority)} label={a.priority} description={a.action} source={a.owner} />
          ))}
        </div>
      )}

      {/* Conference agenda */}
      {(d.conference_agenda ?? []).length > 0 && (
        <div className="bg-panel border border-border-subtle rounded-sm overflow-hidden">
          <div className="px-4 py-2 border-b border-border-subtle">
            <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">Conference Agenda</span>
          </div>
          {d.conference_agenda.map((item: AnyRecord, i: number) => (
            <div key={i} className="flex gap-3 px-4 py-2.5 border-b border-border-subtle last:border-0">
              <span className="font-mono text-2xs text-text-tertiary w-8 flex-shrink-0 pt-0.5">{item.time_minutes}m</span>
              <div>
                <span className="text-xs text-accent-text font-mono">{item.presenting_role}</span>
                <span className="text-xs text-text-primary"> — {item.agenda_item}</span>
                {item.key_question && <p className="text-2xs text-text-secondary mt-0.5 italic">{item.key_question}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient instructions */}
      {d.handoff_packages?.patient_instructions && (
        <div className="bg-panel border border-border-subtle rounded-sm p-4">
          <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-3">Patient Instructions</div>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{d.handoff_packages.patient_instructions}</p>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-2xs font-mono text-text-tertiary border-t border-border-subtle pt-3">
        <span>Model: {d.meta?.model ?? "claude-opus-4-7"}</span>
        <span>Confidence: {d.meta?.synthesis_confidence}</span>
        <span>Synthesized: {d.synthesis_timestamp ? new Date(d.synthesis_timestamp).toLocaleString() : "—"}</span>
        <Link href="/" className="text-info-text hover:underline">← Patient list</Link>
        <Link href="/intake" className="text-accent-text hover:underline">+ New patient</Link>
      </div>
    </div>
  );
}
