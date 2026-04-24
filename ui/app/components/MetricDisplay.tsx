// MetricDisplay — large number + label, used for LACE, risk %, discharge status

import { Severity } from "./StatusPill";

const VALUE_COLOR: Record<Severity, string> = {
  critical: "text-critical-text",
  warning:  "text-warning-text",
  moderate: "text-moderate-text",
  ok:       "text-ok-text",
  info:     "text-info-text",
  accent:   "text-accent-text",
  neutral:  "text-text-primary",
};

interface MetricDisplayProps {
  value: string | number;
  label: string;
  sublabel?: string;
  severity?: Severity;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MetricDisplay({
  value,
  label,
  sublabel,
  severity = "neutral",
  size = "md",
  className = "",
}: MetricDisplayProps) {
  const valueCls = VALUE_COLOR[severity];

  const valueSize =
    size === "lg" ? "text-6xl" :
    size === "md" ? "text-4xl" :
    "text-2xl";

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">
        {label}
      </span>
      <span className={`font-mono font-semibold leading-none tabular-nums animate-count-up ${valueSize} ${valueCls}`}>
        {value}
      </span>
      {sublabel && (
        <span className="text-2xs text-text-secondary mt-1 font-mono">
          {sublabel}
        </span>
      )}
    </div>
  );
}
