"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CaseMeta {
  id: number;
  name: string;
  age: string;
  diagnosis: string;
  teaches: string;
  laceHint: number;
  ehrSource: string;
}

const CASES: CaseMeta[] = [
  {
    id: 1,
    name: "Margaret Chen",
    age: "78F",
    diagnosis: "CHF exacerbation + Pneumonia",
    teaches: "Baseline multi-agent coordination",
    laceHint: 12,
    ehrSource: "MRN-748291 · Cardiology/Step-Down",
  },
  {
    id: 2,
    name: "Robert Jackson",
    age: "65M",
    diagnosis: "Post-stroke, mild hemiparesis",
    teaches: "Value conflict navigation",
    laceHint: 10,
    ehrSource: "MRN-302847 · Neurology",
  },
  {
    id: 3,
    name: "Sarah Williams",
    age: "42F",
    diagnosis: "DKA + 7wk pregnancy (newly confirmed)",
    teaches: "Life-saving catch",
    laceHint: 13,
    ehrSource: "MRN-619403 · Medicine/ICU Step-Down",
  },
];

const ROLES = [
  { key: "physician", label: "Physician", icon: "👨‍⚕️" },
  { key: "nurse", label: "Nurse", icon: "👩‍⚕️" },
  { key: "pharmacist", label: "Pharmacist", icon: "💊" },
  { key: "msw", label: "Social Worker", icon: "🤝" },
  { key: "pt", label: "Physical Therapist", icon: "🏃" },
];

// ── Progress stages ───────────────────────────────────────────────────────────

type Stage =
  | "idle"
  | "connecting"
  | "ehr_pull"
  | "agents"
  | "orchestrator"
  | "done";

const STAGE_DELAYS: Record<Stage, number> = {
  idle: 0,
  connecting: 400,
  ehr_pull: 800,
  agents: 1000,
  orchestrator: 0, // triggered by API response
  done: 0,
};

// ── Colour helpers ─────────────────────────────────────────────────────────────

function probColor(pct: number): string {
  if (pct >= 70) return "text-green-600";
  if (pct >= 40) return "text-amber-600";
  return "text-red-600";
}

function probBg(pct: number): string {
  if (pct >= 70) return "bg-green-50 border-green-200";
  if (pct >= 40) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function riskBg(pct: number): string {
  if (pct <= 15) return "bg-green-50 border-green-200 text-green-700";
  if (pct <= 25) return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-red-50 border-red-200 text-red-700";
}

function readinessLabel(r: string): { label: string; cls: string } {
  if (r === "ready") return { label: "READY", cls: "bg-green-600" };
  if (r === "conditional") return { label: "CONDITIONAL", cls: "bg-amber-500" };
  return { label: "NOT READY", cls: "bg-red-600" };
}

function priorityCls(p: string): string {
  const map: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-800 border-red-300",
    HIGH: "bg-amber-100 text-amber-800 border-amber-300",
    MODERATE: "bg-blue-100 text-blue-700 border-blue-300",
    LOW: "bg-gray-100 text-gray-600 border-gray-300",
  };
  return map[p] ?? "bg-gray-100 text-gray-600 border-gray-300";
}

// ── Result panels ─────────────────────────────────────────────────────────────

function ProbabilityBar({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
      <div
        className={`h-2 rounded-full ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"}`}
        style={{ width: `${pct}%` }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>0%</span>
        <span>{label}</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function RoundsPage() {
  const [selectedCase, setSelectedCase] = useState<CaseMeta | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [agentsDone, setAgentsDone] = useState<Set<string>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Animate agent completions with staggered delays once agents stage starts
  useEffect(() => {
    if (stage !== "agents") return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    ROLES.forEach((role, i) => {
      timeouts.push(
        setTimeout(() => {
          setAgentsDone((prev) => { const next = new Set(Array.from(prev)); next.add(role.key); return next; });
        }, 1200 + i * 900)
      );
    });
    return () => timeouts.forEach(clearTimeout);
  }, [stage]);

  async function handleRun() {
    if (!selectedCase) return;
    setResult(null);
    setError(null);
    setAgentsDone(new Set());

    // Animate stages
    setStage("connecting");
    await delay(STAGE_DELAYS.connecting);
    setStage("ehr_pull");
    await delay(STAGE_DELAYS.ehr_pull);
    setStage("agents");
    await delay(STAGE_DELAYS.agents);

    // Kick off real API call in parallel with animation
    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: selectedCase.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "API error");
      }
      setStage("orchestrator");
      await delay(1200);
      const data = await res.json();
      setResult(data);
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStage("idle");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discharge Planning Rounds</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select a patient · AI agents analyze EHR data · Orchestrator synthesizes discharge decision
        </p>
      </div>

      {/* Patient selection */}
      <div className="grid gap-3 md:grid-cols-3">
        {CASES.map((c) => (
          <button
            key={c.id}
            onClick={() => { setSelectedCase(c); setStage("idle"); setResult(null); setError(null); }}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              selectedCase?.id === c.id
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-400"
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="text-xs font-mono text-gray-400">CASE-00{c.id}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                c.laceHint >= 13 ? "bg-red-100 text-red-700" :
                c.laceHint >= 10 ? "bg-amber-100 text-amber-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                LACE {c.laceHint}
              </span>
            </div>
            <div className="font-semibold text-gray-900">{c.name}</div>
            <div className="text-xs text-gray-500">{c.age} · {c.diagnosis}</div>
            <div className="text-xs text-blue-600 font-medium mt-1">{c.teaches}</div>
            <div className="text-xs text-gray-400 mt-1.5 border-t border-gray-100 pt-1.5">
              📋 {c.ehrSource}
            </div>
          </button>
        ))}
      </div>

      {/* Run button */}
      {selectedCase && stage === "idle" && !result && (
        <button
          onClick={handleRun}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
        >
          Run Rounds AI — {selectedCase.name}
        </button>
      )}

      {/* Progress panel */}
      {stage !== "idle" && stage !== "done" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-700">
            {stage === "connecting" && "🔌 Connecting to hospital EHR..."}
            {stage === "ehr_pull" && "📋 Pulling patient data from EHR..."}
            {stage === "agents" && "🧠 5 specialist agents analyzing in parallel..."}
            {stage === "orchestrator" && "⚡ Orchestrator synthesizing all findings..."}
          </p>

          {/* EHR steps */}
          <div className="space-y-1 text-xs text-gray-500">
            <div className={`flex items-center gap-2 ${stage !== "connecting" ? "text-green-600" : "text-gray-400"}`}>
              {stage !== "connecting" ? "✓" : <Spinner />}
              EHR connection established
            </div>
            <div className={`flex items-center gap-2 ${
              stage === "ehr_pull" ? "text-gray-400" :
              stage !== "connecting" ? "text-green-600" : "text-gray-300"
            }`}>
              {stage === "agents" || stage === "orchestrator" ? "✓" :
               stage === "ehr_pull" ? <Spinner /> : "·"}
              Patient data pulled · {selectedCase?.ehrSource}
            </div>
          </div>

          {/* Agent status */}
          {(stage === "agents" || stage === "orchestrator") && (
            <div className="grid grid-cols-5 gap-2 pt-2 border-t border-gray-100">
              {ROLES.map((role) => {
                const done = agentsDone.has(role.key);
                return (
                  <div key={role.key} className={`text-center p-2 rounded-lg border text-xs transition-all ${
                    done ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}>
                    <div className="text-lg">{role.icon}</div>
                    <div className="font-medium mt-0.5">{role.label}</div>
                    <div className="mt-0.5">
                      {done ? <span className="text-green-600 font-bold">✓</span> : <Spinner size="xs" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {stage === "orchestrator" && (
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
              <Spinner />
              Orchestrator (Opus 4.5) synthesizing conflicts, gaps, discharge probability...
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
          ⚠ {error}
          <button onClick={() => { setStage("idle"); setError(null); }} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Results */}
      {result && stage === "done" && (
        <Results result={result} caseMeta={selectedCase!} onReset={() => { setStage("idle"); setResult(null); }} />
      )}
    </div>
  );
}

// ── Results component ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Results({ result, caseMeta, onReset }: { result: any; caseMeta: CaseMeta; onReset: () => void }) {
  const readiness = readinessLabel(result.discharge_readiness ?? "not_ready");
  const todayProb = result.discharge_today_probability ?? {};
  const risk30d = result.readmission_risk_30d ?? {};
  const lace = result.lace_score ?? {};
  const criticalActions = (result.prioritized_actions ?? []).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any) => a.priority === "CRITICAL"
  );
  const otherActions = (result.prioritized_actions ?? []).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any) => a.priority !== "CRITICAL"
  );

  return (
    <div className="space-y-5">
      {/* ── Dual probability header ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Patient bar */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="font-bold text-gray-900">{caseMeta.name}</span>
            <span className="text-gray-500 text-sm ml-2">{caseMeta.age} · {caseMeta.diagnosis}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${readiness.cls}`}>
              {readiness.label}
            </span>
            <button onClick={onReset} className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-1 rounded">
              ← New patient
            </button>
          </div>
        </div>

        {/* Probability cards */}
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          {/* Discharge today */}
          <div className={`p-5 border ${probBg(todayProb.score_pct ?? 0)}`}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Discharge Today
            </div>
            <div className={`text-5xl font-bold leading-none ${probColor(todayProb.score_pct ?? 0)}`}>
              {todayProb.score_pct ?? "—"}%
            </div>
            <ProbabilityBar pct={todayProb.score_pct ?? 0} label="Can discharge today" />
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              {todayProb.interpretation}
            </p>
            {(todayProb.key_blockers ?? []).length > 0 && (
              <div className="mt-2 space-y-0.5">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(todayProb.key_blockers ?? []).map((b: any, i: number) => (
                  <div key={i} className="text-xs text-red-700 flex items-start gap-1">
                    <span className="flex-shrink-0 mt-0.5">✗</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 30-day readmission risk */}
          <div className={`p-5 border ${riskBg(risk30d.score_pct ?? 0)}`}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              30-Day Readmission Risk
            </div>
            <div className={`text-5xl font-bold leading-none ${
              (risk30d.score_pct ?? 0) <= 15 ? "text-green-700" :
              (risk30d.score_pct ?? 0) <= 25 ? "text-amber-700" :
              "text-red-700"
            }`}>
              {risk30d.score_pct ?? "—"}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {risk30d.source} · LACE {lace.total} [{lace.tier?.replace("_", " ")}]
            </div>
            <ProbabilityBar pct={risk30d.score_pct ?? 0} label="30-day readmission" />
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              {risk30d.interpretation}
            </p>
          </div>
        </div>

        {/* Rationale */}
        <div className="px-5 py-3 bg-red-50 border-t border-red-100">
          <p className="text-xs text-red-900 leading-relaxed">
            <span className="font-semibold">Rationale: </span>
            {result.discharge_readiness_rationale}
          </p>
        </div>
      </div>

      {/* ── Critical actions ── */}
      {criticalActions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            ⚡ Critical Actions — Before Discharge
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {criticalActions.length}
            </span>
          </h2>
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {criticalActions.map((a: any) => (
              <div key={a.rank} className="border-l-4 border-l-red-500 bg-white border border-gray-100 rounded-r-lg p-3">
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded border font-semibold ${priorityCls(a.priority)}`}>
                    {a.priority}
                  </span>
                  <div>
                    <p className="text-sm text-gray-900 font-medium leading-snug">{a.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="font-medium">{a.owner}</span> · {a.urgency}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 italic">{a.rationale}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Conflicts ── */}
      <details className="group">
        <summary className="flex items-center justify-between cursor-pointer py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            Conflicts
            <span className="text-xs font-normal text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
              {(result.conflicts ?? []).length}
            </span>
          </span>
          <span className="text-xs text-gray-400 group-open:hidden">▼ expand</span>
          <span className="text-xs text-gray-400 hidden group-open:inline">▲ collapse</span>
        </summary>
        <div className="mt-3 space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(result.conflicts ?? []).map((c: any) => (
            <div key={c.conflict_id} className="bg-white border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 font-mono flex-shrink-0">
                  {c.conflict_id}
                </span>
                <p className="text-sm font-medium text-gray-900">{c.summary}</p>
              </div>
              <div className="space-y-1">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(c.positions ?? []).map((p: any, i: number) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="font-semibold text-gray-700 w-28 flex-shrink-0">{p.holder}:</span>
                    <span className="text-gray-600">{p.position}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* ── Gaps ── */}
      <details className="group">
        <summary className="flex items-center justify-between cursor-pointer py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            Gaps Identified
            <span className="text-xs font-normal text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
              {(result.gaps ?? []).length}
            </span>
          </span>
          <span className="text-xs text-gray-400 group-open:hidden">▼ expand</span>
          <span className="text-xs text-gray-400 hidden group-open:inline">▲ collapse</span>
        </summary>
        <div className="mt-3 space-y-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(result.gaps ?? []).map((g: any) => (
            <div key={g.gap_id} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 font-mono flex-shrink-0">
                  {g.gap_id}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{g.summary}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="font-medium">{g.owner}</span> · {g.urgency}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{g.action_required}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* ── Conference agenda ── */}
      <details className="group" open>
        <summary className="flex items-center justify-between cursor-pointer py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Conference Agenda (15 min)</span>
          <span className="text-xs text-gray-400 group-open:hidden">▼ expand</span>
          <span className="text-xs text-gray-400 hidden group-open:inline">▲ collapse</span>
        </summary>
        <div className="mt-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(result.conference_agenda ?? []).map((item: any, i: number) => (
            <div key={item.order} className={`flex gap-3 px-4 py-3 ${i !== 0 ? "border-t border-gray-100" : ""}`}>
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-xs font-bold text-gray-400">{item.time_minutes}m</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  <span className="text-blue-600">{item.presenting_role}</span> — {item.agenda_item}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 italic">{item.key_question}</p>
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* ── Other actions (collapsed) ── */}
      {otherActions.length > 0 && (
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Additional Actions
              <span className="text-xs font-normal text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                {otherActions.length}
              </span>
            </span>
            <span className="text-xs text-gray-400 group-open:hidden">▼ expand</span>
            <span className="text-xs text-gray-400 hidden group-open:inline">▲ collapse</span>
          </summary>
          <div className="mt-3 space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {otherActions.map((a: any) => (
              <div key={a.rank} className={`border-l-4 ${
                a.priority === "HIGH" ? "border-l-amber-500" :
                a.priority === "MODERATE" ? "border-l-blue-400" : "border-l-gray-300"
              } bg-white border border-gray-100 rounded-r-lg p-3`}>
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded border font-semibold ${priorityCls(a.priority)}`}>
                    {a.priority}
                  </span>
                  <div>
                    <p className="text-sm text-gray-800 leading-snug">{a.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.owner} · {a.urgency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* ── Patient instructions ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Patient Instructions (5th-grade reading level)</h2>
        <div className="bg-white border border-green-200 rounded-xl p-5">
          <PatientInstructionsText text={result.handoff_packages?.patient_instructions ?? ""} />
        </div>
      </div>

      {/* ── Meta ── */}
      <div className="text-xs text-gray-400 border-t border-gray-100 pt-3 flex flex-wrap gap-3">
        <span>Model: {result.meta?.model}</span>
        <span>Confidence: {result.meta?.synthesis_confidence}</span>
        <span>Agents: {(result.meta?.agents_providing_output ?? []).join(", ")}</span>
        <span>Synthesized: {result.synthesis_timestamp ? new Date(result.synthesis_timestamp).toLocaleString() : "—"}</span>
        <Link href={`/case/${result.patient_id?.replace("CASE-00", "")}`} className="text-blue-400 hover:underline">
          View static reference output →
        </Link>
      </div>
    </div>
  );
}

function PatientInstructionsText({ text }: { text: string }) {
  const hasPending = /\[[^\]]+\]/.test(text);
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <div>
      {hasPending && (
        <div className="mb-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg">
          ⚠ Contains <strong>pending medication decisions</strong> (highlighted). Resolve before giving to patient.
        </div>
      )}
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
        {parts.map((part, i) =>
          /^\[/.test(part) ? (
            <mark key={i} className="bg-amber-100 text-amber-900 px-0.5 rounded">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>
    </div>
  );
}

function Spinner({ size = "sm" }: { size?: "xs" | "sm" }) {
  const cls = size === "xs" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
  return (
    <span
      className={`inline-block ${cls} border-2 border-current border-t-transparent rounded-full animate-spin opacity-60`}
    />
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
