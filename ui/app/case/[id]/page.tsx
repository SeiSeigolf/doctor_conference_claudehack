import { notFound } from "next/navigation";
import { loadCase, CASE_META } from "../../lib/data";
import { Priority, ReadinessStatus, RiskTier, Action, Conflict, Gap } from "../../lib/types";

// ── Colour helpers ────────────────────────────────────────────────────────────

function readinessBg(r: ReadinessStatus) {
  if (r === "ready") return "bg-green-600";
  if (r === "conditional") return "bg-amber-500";
  return "bg-red-600";
}

function priorityBadge(p: Priority) {
  const map: Record<Priority, string> = {
    CRITICAL: "bg-red-100 text-red-800 border-red-300",
    HIGH: "bg-amber-100 text-amber-800 border-amber-300",
    MODERATE: "bg-blue-100 text-blue-700 border-blue-300",
    LOW: "bg-gray-100 text-gray-600 border-gray-300",
  };
  return map[p];
}

function priorityBorder(p: Priority) {
  const map: Record<Priority, string> = {
    CRITICAL: "border-l-red-500",
    HIGH: "border-l-amber-500",
    MODERATE: "border-l-blue-400",
    LOW: "border-l-gray-300",
  };
  return map[p];
}

function laceTierColor(tier: RiskTier) {
  const map: Record<RiskTier, string> = {
    LOW: "text-green-600 bg-green-50 border-green-200",
    MODERATE: "text-blue-600 bg-blue-50 border-blue-200",
    HIGH: "text-amber-600 bg-amber-50 border-amber-200",
    VERY_HIGH: "text-red-600 bg-red-50 border-red-200",
  };
  return map[tier];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, count, subtitle }: { title: string; count?: number; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
        {title}
        {count !== undefined && (
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </h2>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function ActionCard({ action }: { action: Action }) {
  return (
    <div className={`border-l-4 ${priorityBorder(action.priority)} bg-white border border-gray-100 rounded-r-lg p-3`}>
      <div className="flex items-start gap-2">
        <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded border font-semibold ${priorityBadge(action.priority)}`}>
          {action.priority}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-gray-900 font-medium leading-snug">{action.action}</p>
          <p className="text-xs text-gray-500 mt-1">
            <span className="font-medium">{action.owner}</span> · {action.urgency}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 italic">{action.rationale}</p>
        </div>
      </div>
    </div>
  );
}

function ConflictCard({ conflict }: { conflict: Conflict }) {
  return (
    <div className="bg-white border border-orange-200 rounded-lg p-4">
      <div className="flex items-start gap-2 mb-2">
        <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 font-mono">
          {conflict.conflict_id}
        </span>
        <p className="text-sm font-medium text-gray-900 leading-snug">{conflict.summary}</p>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Urgency: <span className="font-medium">{conflict.urgency}</span>
        {conflict.requires_physician_decision && (
          <span className="ml-2 text-red-600 font-medium">· Physician decision required</span>
        )}
      </p>
      <div className="space-y-1 mb-3">
        {conflict.positions.map((pos, i) => (
          <div key={i} className="flex gap-2 text-xs">
            <span className="flex-shrink-0 font-semibold text-gray-700 w-32 truncate">{pos.holder}:</span>
            <span className="text-gray-600">{pos.position}</span>
          </div>
        ))}
      </div>
      {conflict.resolution_options.length > 0 && (
        <div className="border-t border-gray-100 pt-2 space-y-1">
          <p className="text-xs font-medium text-gray-500 mb-1">Resolution options:</p>
          {conflict.resolution_options.map((opt, i) => (
            <div key={i} className="text-xs text-gray-600">
              <span className="font-medium">{opt.option}</span>
              <span className="text-gray-400"> — {opt.trade_off}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GapCard({ gap }: { gap: Gap }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 font-mono">
          {gap.gap_id}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-snug">{gap.summary}</p>
          <p className="text-xs text-gray-500 mt-1">
            <span className="font-medium">{gap.owner}</span> · {gap.urgency}
          </p>
          <p className="text-xs text-gray-600 mt-1">{gap.action_required}</p>
        </div>
      </div>
    </div>
  );
}

function Collapsible({ title, count, children, defaultOpen = false }: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex items-center justify-between cursor-pointer py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-xs font-normal text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </span>
        <span className="text-xs text-gray-400 group-open:hidden">▼ expand</span>
        <span className="text-xs text-gray-400 hidden group-open:inline">▲ collapse</span>
      </summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}

function AgentOutputSection({ agentOutputs }: { agentOutputs: Record<string, Record<string, unknown>> }) {
  const roleLabels: Record<string, string> = {
    physician: "👨‍⚕️ Physician",
    nurse: "👩‍⚕️ Nurse",
    pharmacist: "💊 Pharmacist",
    msw: "🤝 Social Worker",
    pt: "🏃 Physical Therapist",
  };

  return (
    <Collapsible title="5 Agent Outputs (raw)" count={Object.keys(agentOutputs).length}>
      <div className="space-y-3">
        {Object.entries(agentOutputs).map(([role, output]) => (
          <details key={role} className="group/agent">
            <summary className="flex items-center gap-2 cursor-pointer py-1.5 px-3 bg-white border border-gray-200 rounded hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-800">
                {roleLabels[role] ?? role}
              </span>
              <span className="text-xs text-gray-400 group-open/agent:hidden ml-auto">▼</span>
              <span className="text-xs text-gray-400 hidden group-open/agent:inline ml-auto">▲</span>
            </summary>
            <pre className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed text-gray-700">
              {JSON.stringify(output, null, 2)}
            </pre>
          </details>
        ))}
      </div>
    </Collapsible>
  );
}

// Highlight [placeholder] patterns in patient instructions
function PatientInstructions({ text }: { text: string }) {
  const hasPending = /\[[^\]]+\]/.test(text);
  const parts = text.split(/(\[[^\]]+\])/g);

  return (
    <div>
      {hasPending && (
        <div className="mb-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg">
          ⚠ This document contains <strong>pending medication decisions</strong> (shown in amber).
          Bracketed items must be resolved before this is given to the patient.
        </div>
      )}
      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
        {parts.map((part, i) =>
          /^\[/.test(part) ? (
            <mark key={i} className="bg-amber-100 text-amber-900 px-0.5 rounded not-italic">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (!CASE_META[id]) notFound();

  const meta = CASE_META[id];
  const data = loadCase(id);

  const criticalActions = data.prioritized_actions.filter((a) => a.priority === "CRITICAL");
  const otherActions = data.prioritized_actions.filter((a) => a.priority !== "CRITICAL");

  return (
    <div className="space-y-6">
      {/* ── Patient Header ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono text-gray-400">{data.patient_id}</span>
              <span className="text-xs text-blue-600 font-medium bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                {meta.teaches}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{data.patient_name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{meta.diagnosis}</p>
          </div>

          {/* LACE + Readiness */}
          <div className="flex gap-3 items-start flex-wrap">
            <div className={`border rounded-xl px-4 py-3 text-center min-w-[80px] ${laceTierColor(data.lace_score.tier)}`}>
              <div className="text-3xl font-bold leading-none">{data.lace_score.total}</div>
              <div className="text-xs font-semibold mt-0.5">
                LACE · {data.lace_score.tier.replace("_", " ")}
              </div>
            </div>
            <div className={`${readinessBg(data.discharge_readiness)} text-white rounded-xl px-4 py-3 text-center min-w-[100px]`}>
              <div className="text-xs font-semibold uppercase tracking-wide">Discharge</div>
              <div className="text-sm font-bold mt-0.5">
                {data.discharge_readiness === "not_ready"
                  ? "NOT READY"
                  : data.discharge_readiness === "conditional"
                  ? "CONDITIONAL"
                  : "READY"}
              </div>
            </div>
          </div>
        </div>

        {/* Readiness rationale */}
        <div className="mt-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-900">
          <span className="font-semibold">Why not ready: </span>
          {data.discharge_readiness_rationale}
        </div>

        {/* LACE implication */}
        <div className="mt-2 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-xs text-gray-600">
          <span className="font-semibold">LACE implication: </span>
          {data.lace_score.implication}
        </div>
      </div>

      {/* ── Critical Actions (always open) ── */}
      {criticalActions.length > 0 && (
        <div>
          <SectionHeader
            title="⚡ Critical Actions — Before Discharge"
            count={criticalActions.length}
            subtitle="Must be resolved before discharge order can be written"
          />
          <div className="space-y-2">
            {criticalActions.map((a) => (
              <ActionCard key={a.rank} action={a} />
            ))}
          </div>
        </div>
      )}

      {/* ── Conflicts ── */}
      <Collapsible title="Conflicts" count={data.conflicts.length}>
        {data.conflicts.map((c) => (
          <ConflictCard key={c.conflict_id} conflict={c} />
        ))}
      </Collapsible>

      {/* ── Gaps ── */}
      <Collapsible title="Gaps Identified" count={data.gaps.length}>
        {data.gaps.map((g) => (
          <GapCard key={g.gap_id} gap={g} />
        ))}
      </Collapsible>

      {/* ── All Actions (non-critical) ── */}
      {otherActions.length > 0 && (
        <Collapsible title="Additional Actions" count={otherActions.length}>
          <div className="space-y-2">
            {otherActions.map((a) => (
              <ActionCard key={a.rank} action={a} />
            ))}
          </div>
        </Collapsible>
      )}

      {/* ── Conference Agenda ── */}
      <Collapsible title="Conference Agenda (15 min)" defaultOpen>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {data.conference_agenda.map((item, i) => (
            <div
              key={item.order}
              className={`flex gap-3 px-4 py-3 ${i !== 0 ? "border-t border-gray-100" : ""}`}
            >
              <div className="flex-shrink-0 w-10 text-center">
                <span className="text-xs font-bold text-gray-400">{item.time_minutes}m</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  <span className="text-blue-600">{item.presenting_role}</span>{" "}
                  — {item.agenda_item}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 italic">{item.key_question}</p>
              </div>
            </div>
          ))}
        </div>
      </Collapsible>

      {/* ── Patient Instructions ── */}
      <div>
        <SectionHeader
          title="Patient Instructions"
          subtitle="5th-grade reading level · Give to patient at discharge"
        />
        <div className="bg-white border border-green-200 rounded-xl p-5">
          <PatientInstructions text={data.handoff_packages.patient_instructions} />
        </div>
      </div>

      {/* ── Handoff Packages ── */}
      <Collapsible title="Handoff Packages (PCP / Home Health / Pharmacy)">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              PCP Summary Letter
            </h3>
            <div className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-4 whitespace-pre-wrap leading-relaxed">
              {data.handoff_packages.pcp_summary}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Home Health Orders
            </h3>
            <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(data.handoff_packages.home_health_orders, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Pharmacy Counseling
            </h3>
            <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(data.handoff_packages.pharmacy_counseling, null, 2)}
            </pre>
          </div>
        </div>
      </Collapsible>

      {/* ── Agent Outputs ── */}
      {data._agent_outputs && (
        <AgentOutputSection agentOutputs={data._agent_outputs} />
      )}

      {/* ── Meta ── */}
      <div className="text-xs text-gray-400 border-t border-gray-100 pt-4 pb-2 flex flex-wrap gap-4">
        <span>Model: {data.meta.model}</span>
        <span>Confidence: {data.meta.synthesis_confidence}</span>
        <span>Agents: {data.meta.agents_providing_output.join(", ")}</span>
        {data.meta.agents_missing_output.length > 0 && (
          <span className="text-red-400">Missing: {data.meta.agents_missing_output.join(", ")}</span>
        )}
        <span>Synthesized: {new Date(data.synthesis_timestamp).toLocaleString()}</span>
      </div>
    </div>
  );
}
