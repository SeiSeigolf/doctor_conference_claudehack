// AgentCard — one card in the 5-agent pipeline on /rounds
// Status: QUEUED | ANALYZING | COMPLETE | ERROR

export type AgentStatus = "QUEUED" | "ANALYZING" | "COMPLETE" | "ERROR";

export interface AgentCardProps {
  role: string;        // "physician" | "nurse" | etc.
  label: string;       // "PHYSICIAN"
  status: AgentStatus;
  highlights?: string[]; // top 2-3 flagged items shown when COMPLETE
  isOrchestrator?: boolean;
}

const STATUS_CONFIG: Record<AgentStatus, { pill: string; label: string }> = {
  QUEUED:    { pill: "text-text-tertiary border-border-subtle bg-white/5",   label: "QUEUED" },
  ANALYZING: { pill: "text-info-text border-info-border bg-info-bg",         label: "ANALYZING" },
  COMPLETE:  { pill: "text-ok-text border-ok-border bg-ok-bg",               label: "COMPLETE" },
  ERROR:     { pill: "text-critical-text border-critical-border bg-critical-bg", label: "ERROR" },
};

const ROLE_ABBREV: Record<string, string> = {
  physician:   "MD",
  nurse:       "RN",
  pharmacist:  "RPh",
  msw:         "MSW",
  pt:          "PT",
  orchestrator: "AI",
};

function AnalyzingDots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-info-text animate-blink"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </span>
  );
}

export function AgentCard({
  role,
  label,
  status,
  highlights = [],
  isOrchestrator = false,
}: AgentCardProps) {
  const cfg = STATUS_CONFIG[status];
  const abbrev = ROLE_ABBREV[role] ?? role.slice(0, 3).toUpperCase();

  const borderColor = isOrchestrator
    ? "border-accent-border"
    : status === "COMPLETE"
    ? "border-ok-border/50"
    : status === "ANALYZING"
    ? "border-info-border/50"
    : "border-border-subtle";

  const bgColor = isOrchestrator ? "bg-accent-bg" : "bg-card";

  return (
    <div
      className={`
        border rounded-sm p-3 transition-all duration-150
        ${bgColor} ${borderColor}
        animate-fade-in
      `}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Role badge */}
          <span
            className={`
              font-mono text-2xs font-semibold px-1.5 py-0.5 rounded-sm
              ${isOrchestrator
                ? "bg-accent-bg text-accent-text border border-accent-border"
                : "bg-white/10 text-text-secondary border border-border-subtle"}
            `}
          >
            {abbrev}
          </span>
          <span
            className={`
              text-xs font-mono font-semibold tracking-wider
              ${isOrchestrator ? "text-accent-text" : "text-text-primary"}
            `}
          >
            {label}
          </span>
        </div>

        {/* Status pill */}
        <span
          className={`
            inline-flex items-center gap-1
            text-2xs font-mono uppercase tracking-widest
            px-1.5 py-0.5 rounded-sm border
            ${cfg.pill}
          `}
        >
          {status === "ANALYZING" ? <AnalyzingDots /> : null}
          {cfg.label}
        </span>
      </div>

      {/* Highlights (COMPLETE state) */}
      {status === "COMPLETE" && highlights.length > 0 && (
        <ul className="mt-2 space-y-1 border-t border-border-subtle pt-2">
          {highlights.slice(0, 3).map((h, i) => (
            <li
              key={i}
              className="text-2xs text-text-secondary leading-relaxed flex items-start gap-1.5"
            >
              <span className="text-ok-text mt-0.5 flex-shrink-0">›</span>
              <span className="line-clamp-2">{h}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Orchestrator analyzing state */}
      {isOrchestrator && status === "ANALYZING" && (
        <p className="mt-2 text-2xs text-accent-text border-t border-accent-border/30 pt-2">
          Synthesizing conflicts · gaps · risk · handoffs…
        </p>
      )}
    </div>
  );
}
