import Link from "next/link";
import { loadAllCases } from "./lib/data";
import { ReadinessStatus, RiskTier } from "./lib/types";

function readinessBadge(r: ReadinessStatus) {
  const map: Record<ReadinessStatus, string> = {
    ready: "bg-green-100 text-green-800 border-green-200",
    conditional: "bg-amber-100 text-amber-800 border-amber-200",
    not_ready: "bg-red-100 text-red-800 border-red-200",
  };
  const label: Record<ReadinessStatus, string> = {
    ready: "READY",
    conditional: "CONDITIONAL",
    not_ready: "NOT READY",
  };
  return { cls: map[r], label: label[r] };
}

function laceTierColor(tier: RiskTier) {
  const map: Record<RiskTier, string> = {
    LOW: "text-green-600",
    MODERATE: "text-blue-600",
    HIGH: "text-amber-600",
    VERY_HIGH: "text-red-600",
  };
  return map[tier];
}

export default function HomePage() {
  const cases = loadAllCases();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Discharge Planning Rounds</h1>
        <p className="text-gray-500 mt-1 text-sm">
          5 clinical AI agents (Sonnet 4.6) · Orchestrator (Opus 4.5) · 3 synthetic patient cases
        </p>
      </div>

      <div className="grid gap-4">
        {cases.map(({ id, meta, data }) => {
          const badge = readinessBadge(data.discharge_readiness);
          const criticalCount = data.prioritized_actions.filter(
            (a) => a.priority === "CRITICAL"
          ).length;

          return (
            <Link href={`/case/${id}`} key={id} className="block group">
              <div className="bg-white border border-gray-200 rounded-lg p-5 group-hover:border-gray-400 group-hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-gray-400 font-mono">{data.patient_id}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-semibold ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{data.patient_name}</h2>
                    <p className="text-sm text-gray-500">{meta.diagnosis}</p>
                    <p className="text-xs text-blue-600 mt-0.5 font-medium">
                      Teaches: {meta.teaches}
                    </p>
                  </div>

                  {/* LACE */}
                  <div className="text-right flex-shrink-0">
                    <div className={`text-3xl font-bold ${laceTierColor(data.lace_score.tier)}`}>
                      {data.lace_score.total}
                    </div>
                    <div className={`text-xs font-semibold ${laceTierColor(data.lace_score.tier)}`}>
                      LACE · {data.lace_score.tier.replace("_", " ")}
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm border-t border-gray-100 pt-3">
                  <span className="font-semibold text-red-600">
                    ⚡ {criticalCount} critical action{criticalCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-600">
                    {data.conflicts.length} conflict{data.conflicts.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-600">
                    {data.gaps.length} gap{data.gaps.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-400">
                    {data.prioritized_actions.length} total actions
                  </span>
                </div>

                {/* Readiness rationale preview */}
                <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {data.discharge_readiness_rationale}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6">
        <Link
          href="/summary"
          className="inline-block text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 bg-blue-50 px-4 py-2 rounded hover:bg-blue-100 transition-colors"
        >
          → View 3-case comparison summary
        </Link>
      </div>
    </div>
  );
}
