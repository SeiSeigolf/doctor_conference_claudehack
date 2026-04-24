import Link from "next/link";
import { loadAllCases } from "./lib/data";
import { ReadinessStatus, RiskTier } from "./lib/types";
import LocalPatients from "./LocalPatients";

function readinessBadgeCls(r: ReadinessStatus) {
  if (r === "ready")       return "bg-ok-bg text-ok-text border-ok-border";
  if (r === "conditional") return "bg-warning-bg text-warning-text border-warning-border";
  return "bg-critical-bg text-critical-text border-critical-border";
}

function readinessLabel(r: ReadinessStatus) {
  if (r === "ready")       return "READY";
  if (r === "conditional") return "CONDITIONAL";
  return "NOT READY";
}

function laceCls(tier: RiskTier) {
  const map: Record<RiskTier, string> = {
    LOW:       "text-ok-text",
    MODERATE:  "text-info-text",
    HIGH:      "text-warning-text",
    VERY_HIGH: "text-critical-text",
  };
  return map[tier];
}

export default function HomePage() {
  const cases = loadAllCases();

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">
          ROUNDS.ai · DISCHARGE PLANNING INTELLIGENCE
        </div>
        <h1 className="text-2xl font-mono font-semibold text-text-primary">Patient Case List</h1>
        <p className="text-xs text-text-secondary mt-1">
          5 clinical AI agents (Sonnet 4.6) · Orchestrator (Opus 4.7) · Multi-agent discharge synthesis
        </p>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">
          EXAMPLE CASES — SYNTHETIC DATA
        </div>
        <Link
          href="/intake"
          className="flex items-center gap-2 px-4 py-2 bg-accent-bg border border-accent-border text-accent-text font-mono text-xs rounded-sm hover:bg-accent/20 transition-colors"
        >
          + New Patient Intake
        </Link>
      </div>

      {/* Epic-style patient list table */}
      <div className="bg-panel border border-border-subtle rounded-sm overflow-hidden mb-8">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_80px_100px_60px_60px_80px_120px_28px] gap-x-4 px-4 py-2 border-b border-[#1e3a5f] bg-[#0d1b2a]">
          {["Patient / Diagnosis", "Location", "Admission", "LOS", "LACE", "30-Day", "Status", ""].map((h) => (
            <span key={h} className="text-2xs font-mono uppercase tracking-widest text-[#4a6b8a]">{h}</span>
          ))}
        </div>

        {cases.map(({ id, meta, data }) => {
          const criticalCount = data.prioritized_actions.filter((a) => a.priority === "CRITICAL").length;
          const risk30d = (data as unknown as Record<string, unknown> & { readmission_risk_30d?: { score_pct?: number } }).readmission_risk_30d;

          return (
            <Link href={`/case/${id}`} key={id} className="block group">
              <div className="grid grid-cols-[1fr_80px_100px_60px_60px_80px_120px_28px] gap-x-4 px-4 py-3 border-b border-border-subtle/50 last:border-0 hover:bg-[#0d1b2a] transition-colors items-center">
                {/* Patient name + diagnosis */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-text-primary truncate">{data.patient_name}</span>
                    <span className="text-2xs font-mono px-1.5 py-0.5 rounded border border-border-subtle text-text-tertiary bg-white/5 flex-shrink-0">
                      EXAMPLE
                    </span>
                    {criticalCount > 0 && (
                      <span className="text-2xs font-mono px-1.5 py-0.5 rounded border border-critical-border text-critical-text bg-critical-bg flex-shrink-0">
                        {criticalCount} CRIT
                      </span>
                    )}
                  </div>
                  <div className="text-2xs text-text-tertiary mt-0.5 truncate">{meta.diagnosis} · {meta.teaches}</div>
                </div>

                {/* Location */}
                <span className="text-xs font-mono text-text-secondary truncate">{data.patient_id}</span>

                {/* Admission date */}
                <span className="text-xs font-mono text-text-secondary">—</span>

                {/* LOS */}
                <span className="text-xs font-mono text-text-secondary tabular-nums">—</span>

                {/* LACE */}
                <span className={`font-mono text-lg font-bold tabular-nums ${laceCls(data.lace_score.tier)}`}>
                  {data.lace_score.total}
                </span>

                {/* 30-day risk */}
                <span className={`font-mono text-sm font-semibold tabular-nums ${
                  (risk30d?.score_pct ?? 0) > 25 ? "text-critical-text" :
                  (risk30d?.score_pct ?? 0) > 15 ? "text-warning-text" : "text-ok-text"
                }`}>
                  {risk30d?.score_pct !== undefined ? `${risk30d.score_pct}%` : "—"}
                </span>

                {/* Readiness badge */}
                <span className={`text-2xs font-mono px-2 py-1 rounded-sm border text-center ${readinessBadgeCls(data.discharge_readiness)}`}>
                  {readinessLabel(data.discharge_readiness)}
                </span>

                <span className="text-text-tertiary text-xs font-mono group-hover:text-text-secondary transition-colors">→</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* User-entered patients from localStorage (client component) */}
      <LocalPatients />

      {/* Bottom nav */}
      <div className="mt-6 flex items-center gap-4">
        <Link
          href="/summary"
          className="text-xs font-mono text-info-text hover:text-white border border-info-border bg-info-bg px-4 py-2 rounded-sm transition-colors"
        >
          → 3-case comparison table
        </Link>
        <Link
          href="/rounds"
          className="text-xs font-mono text-accent-text hover:text-white border border-accent-border bg-accent-bg px-4 py-2 rounded-sm transition-colors"
        >
          → Live rounds demo
        </Link>
      </div>
    </div>
  );
}
