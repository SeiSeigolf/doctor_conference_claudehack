// StatusPill — pill-shaped severity indicator
// severity: "critical" | "warning" | "moderate" | "ok" | "info" | "accent" | "neutral"

export type Severity = "critical" | "warning" | "moderate" | "ok" | "info" | "accent" | "neutral";

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "bg-critical-bg text-critical-text border-critical-border",
  warning:  "bg-warning-bg  text-warning-text  border-warning-border",
  moderate: "bg-moderate-bg text-moderate-text border-moderate-border",
  ok:       "bg-ok-bg       text-ok-text       border-ok-border",
  info:     "bg-info-bg     text-info-text     border-info-border",
  accent:   "bg-accent-bg   text-accent-text   border-accent-border",
  neutral:  "bg-white/5     text-text-secondary border-border-subtle",
};

interface StatusPillProps {
  severity: Severity;
  label: string;
  dot?: boolean;
  className?: string;
}

export function StatusPill({ severity, label, dot = false, className = "" }: StatusPillProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2 py-0.5 rounded-full
        border
        font-mono text-2xs uppercase tracking-widest
        whitespace-nowrap
        ${SEVERITY_STYLES[severity]}
        ${className}
      `}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: "currentColor" }}
        />
      )}
      {label}
    </span>
  );
}

// Convenience: map Priority string → Severity
export function priorityToSeverity(p: string): Severity {
  const map: Record<string, Severity> = {
    CRITICAL: "critical",
    HIGH:     "warning",
    MODERATE: "moderate",
    LOW:      "neutral",
  };
  return map[p] ?? "neutral";
}

// Convenience: map readiness string → Severity
export function readinessToSeverity(r: string): Severity {
  if (r === "ready")       return "ok";
  if (r === "conditional") return "warning";
  return "critical";
}

// Convenience: map LACE tier → Severity
export function laceTierToSeverity(t: string): Severity {
  if (t === "LOW")      return "ok";
  if (t === "MODERATE") return "info";
  if (t === "HIGH")     return "warning";
  return "critical"; // VERY_HIGH
}
