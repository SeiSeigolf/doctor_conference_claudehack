"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StatusPill, readinessToSeverity, laceTierToSeverity, priorityToSeverity } from "../../components/StatusPill";
import { MetricDisplay } from "../../components/MetricDisplay";
import { FindingRow } from "../../components/FindingRow";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnyRecord | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(`rounds_synthesis_${id}`);
    if (!raw) { setNotFound(true); return; }
    setData(JSON.parse(raw));
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-2">PATIENT NOT FOUND</div>
        <p className="text-sm text-text-secondary mb-4">No synthesis result found for this patient ID. It may have been cleared from browser storage.</p>
        <Link href="/" className="text-info-text text-sm font-mono hover:underline">← Return to case list</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary animate-pulse">LOADING SYNTHESIS RESULT…</div>
      </div>
    );
  }

  const readiness = data.discharge_readiness ?? "not_ready";
  const lace = data.lace_score ?? {};
  const risk30d = data.readmission_risk_30d ?? {};
  const criticalActions = (data.prioritized_actions ?? []).filter((a: AnyRecord) => a.priority === "CRITICAL");
  const otherActions = (data.prioritized_actions ?? []).filter((a: AnyRecord) => a.priority !== "CRITICAL");

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {/* Header */}
      <div className="bg-panel border border-border-subtle rounded-sm p-4 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">USER-ENTERED PATIENT · SYNTHESIS COMPLETE</div>
          <h1 className="text-xl font-mono font-semibold text-text-primary">{data.patient_name ?? "Patient"}</h1>
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
      {data.discharge_readiness_rationale && (
        <div className="bg-critical-bg border border-critical-border rounded-sm px-4 py-3">
          <span className="text-2xs font-mono uppercase tracking-widest text-critical-text">Discharge Hold Rationale </span>
          <p className="text-xs text-text-primary mt-1 leading-relaxed">{data.discharge_readiness_rationale}</p>
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
        {(data.conflicts ?? []).slice(0, 3).map((c: AnyRecord, i: number) => (
          <FindingRow key={`c${i}`} severity="warning" label="CONFLICT" description={c.summary} source={c.positions?.map((p: AnyRecord) => p.holder).join(" · ")} />
        ))}
        {(data.gaps ?? []).slice(0, 4).map((g: AnyRecord, i: number) => (
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
      {(data.conference_agenda ?? []).length > 0 && (
        <div className="bg-panel border border-border-subtle rounded-sm overflow-hidden">
          <div className="px-4 py-2 border-b border-border-subtle">
            <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">Conference Agenda</span>
          </div>
          {data.conference_agenda.map((item: AnyRecord, i: number) => (
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
      {data.handoff_packages?.patient_instructions && (
        <div className="bg-panel border border-border-subtle rounded-sm p-4">
          <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-3">Patient Instructions</div>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{data.handoff_packages.patient_instructions}</p>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-2xs font-mono text-text-tertiary border-t border-border-subtle pt-3">
        <span>Model: {data.meta?.model ?? "claude-opus-4-7"}</span>
        <span>Confidence: {data.meta?.synthesis_confidence}</span>
        <span>Synthesized: {data.synthesis_timestamp ? new Date(data.synthesis_timestamp).toLocaleString() : "—"}</span>
        <Link href="/" className="text-info-text hover:underline">← Patient list</Link>
        <Link href="/intake" className="text-accent-text hover:underline">+ New patient</Link>
      </div>
    </div>
  );
}
