"use client";

import { PatientRecord, ROLE_KEYS, ROLE_ABBREV } from "../lib/patientStore";

type AnyRecord = Record<string, unknown>;

function readinessCls(r?: string) {
  if (r === "ready") return "bg-ok-bg text-ok-text border-ok-border";
  if (r === "conditional") return "bg-warning-bg text-warning-text border-warning-border";
  if (r) return "bg-critical-bg text-critical-text border-critical-border";
  return "border-border-subtle text-text-tertiary";
}

function readinessLabel(r?: string) {
  if (r === "ready") return "READY FOR DISCHARGE";
  if (r === "conditional") return "CONDITIONAL DISCHARGE";
  if (r) return "HOLD — NOT READY";
  return "PENDING ASSESSMENT";
}

interface PatientBannerProps {
  patient: PatientRecord;
  synth?: AnyRecord | null;
}

export function PatientBanner({ patient, synth }: PatientBannerProps) {
  const { basic } = patient;
  const mrn = `MRN-${patient.id.slice(0, 6).toUpperCase()}`;
  const completedRoles = ROLE_KEYS.filter((k) => patient[k] !== null);
  const readiness = synth?.discharge_readiness as string | undefined;
  const lace = synth?.lace_score as AnyRecord | undefined;
  const allergies =
    (patient.pharmacist as AnyRecord | null)?.allergies as string | undefined || "NKA";

  return (
    <div className="sticky top-0 z-20 border-b-2 border-[#1e56a0] bg-[#0a1628]">
      {/* Primary banner row */}
      <div className="flex items-center gap-5 px-4 py-2 flex-wrap">
        {/* Name + MRN */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono font-bold text-base text-white">
            {basic.name || "Unknown Patient"}
          </span>
          <span className="font-mono text-2xs px-1.5 py-0.5 bg-[#1e3a5f] text-[#5b9bd5] rounded">
            {mrn}
          </span>
        </div>

        {/* Demographics */}
        <div className="flex items-center divide-x divide-[#1e3a5f] text-2xs font-mono text-[#7bafd4]">
          <span className="pr-3">
            {basic.age ? `${basic.age}yo` : "—"}{" "}
            {basic.sex === "F" ? "Female" : basic.sex === "M" ? "Male" : basic.sex}
          </span>
          <span className="px-3">Adm {basic.admissionDate || "—"}</span>
          <span className="px-3">LOS {basic.losDays || "—"}d</span>
          <span className="px-3">{basic.unit || "Unit TBD"}</span>
          <span className="px-3">{basic.admissionType}</span>
        </div>

        {/* Allergies — Epic highlights this prominently */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-2xs font-mono text-[#ff6b6b] font-bold tracking-widest">ALLG</span>
          <span className="text-2xs font-mono text-[#ffa0a0]">{allergies}</span>
        </div>

        {/* LACE */}
        {lace?.total !== undefined && (
          <div className="flex items-center gap-1 px-2 py-0.5 border border-[#1e3a5f] rounded flex-shrink-0">
            <span className="text-2xs font-mono text-[#7bafd4]">LACE</span>
            <span className="font-mono font-bold text-warning-text tabular-nums">
              {lace.total as number}
            </span>
            <span className="text-2xs font-mono text-[#7bafd4]">
              {String(lace.tier ?? "").replace("_", " ")}
            </span>
          </div>
        )}

        {/* Discharge readiness */}
        <span className={`text-2xs font-mono px-2 py-0.5 rounded border flex-shrink-0 ${readinessCls(readiness)}`}>
          {readinessLabel(readiness)}
        </span>

        {/* Care team completion */}
        <div className="ml-auto flex items-center gap-1 flex-shrink-0">
          <span className="text-2xs font-mono text-[#4a6b8a] mr-1">Team:</span>
          {ROLE_KEYS.map((role) => (
            <span
              key={role}
              title={`${role} — ${completedRoles.includes(role) ? "documented" : "pending"}`}
              className={`text-2xs font-mono px-1.5 py-0.5 rounded border ${
                completedRoles.includes(role)
                  ? "border-ok-border text-ok-text bg-ok-bg"
                  : "border-[#1e3a5f] text-[#4a6b8a]"
              }`}
            >
              {ROLE_ABBREV[role]}
            </span>
          ))}
        </div>
      </div>

      {/* Chief complaint sub-bar */}
      {basic.chiefComplaint && (
        <div className="px-4 py-1 bg-[#060f1a] border-t border-[#1e3a5f] flex items-center gap-2">
          <span className="text-2xs font-mono text-[#4a6b8a] uppercase tracking-widest flex-shrink-0">
            Chief Complaint
          </span>
          <span className="text-2xs font-mono text-[#a8c4e0]">{basic.chiefComplaint}</span>
        </div>
      )}
    </div>
  );
}
