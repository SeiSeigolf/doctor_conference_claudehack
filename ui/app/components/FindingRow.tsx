// FindingRow — one item in the live findings feed on /rounds right panel

import { Severity, StatusPill } from "./StatusPill";

export interface FindingRowProps {
  severity: Severity;
  label: string;       // short severity label e.g. "CRITICAL", "GAP"
  description: string;
  source?: string;     // agent attribution e.g. "PHARMACIST"
  pinned?: boolean;    // pinned items stay at top
  className?: string;
}

export function FindingRow({
  severity,
  label,
  description,
  source,
  className = "",
}: FindingRowProps) {
  return (
    <div
      className={`
        flex items-start gap-2 py-2 px-3
        border-b border-border-subtle last:border-0
        animate-slide-in
        ${className}
      `}
    >
      <StatusPill severity={severity} label={label} className="flex-shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-text-primary leading-snug line-clamp-3">
          {description}
        </p>
        {source && (
          <span className="text-2xs font-mono text-text-tertiary mt-0.5 block">
            {source}
          </span>
        )}
      </div>
    </div>
  );
}
