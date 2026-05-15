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
  if (r === "ready") return "退院可";
  if (r === "conditional") return "条件付き退院";
  if (r) return "保留・未準備";
  return "評価待ち";
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
    (patient.pharmacist as AnyRecord | null)?.allergies as string | undefined || "既知なし";

  return (
    <div className="sticky top-0 z-20 border-b-2 border-accent-border bg-white">
      {/* Primary banner row */}
      <div className="flex items-center gap-5 px-4 py-2 flex-wrap">
        {/* Name + MRN */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono font-bold text-base text-text-primary">
            {basic.name || "患者名未入力"}
          </span>
          <span className="font-mono text-2xs px-1.5 py-0.5 bg-accent-bg text-accent-text rounded">
            {mrn}
          </span>
        </div>

        {/* Demographics */}
        <div className="flex items-center divide-x divide-border-subtle text-2xs font-mono text-text-secondary">
          <span className="pr-3">
            {basic.age ? `${basic.age}歳` : "—"}{" "}
            {basic.sex === "F" ? "女性" : basic.sex === "M" ? "男性" : basic.sex}
          </span>
          <span className="px-3">入院 {basic.admissionDate || "—"}</span>
          <span className="px-3">入院日数 {basic.losDays || "—"}日</span>
          <span className="px-3">{basic.unit || "病棟未定"}</span>
          <span className="px-3">{basic.admissionType}</span>
        </div>

        {/* Allergies — Epic highlights this prominently */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-2xs font-mono text-critical-text font-bold tracking-widest">アレルギー</span>
          <span className="text-2xs font-mono text-critical-text">{allergies}</span>
        </div>

        {/* LACE */}
        {lace?.total !== undefined && (
          <div className="flex items-center gap-1 px-2 py-0.5 border border-border-subtle rounded flex-shrink-0">
            <span className="text-2xs font-mono text-text-secondary">LACE</span>
            <span className="font-mono font-bold text-warning-text tabular-nums">
              {lace.total as number}
            </span>
            <span className="text-2xs font-mono text-text-secondary">
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
          <span className="text-2xs font-mono text-text-tertiary mr-1">チーム:</span>
          {ROLE_KEYS.map((role) => (
            <span
              key={role}
              title={`${role} — ${completedRoles.includes(role) ? "記録済み" : "未入力"}`}
              className={`text-2xs font-mono px-1.5 py-0.5 rounded border ${
                completedRoles.includes(role)
                  ? "border-ok-border text-ok-text bg-ok-bg"
                  : "border-border-subtle text-text-tertiary"
              }`}
            >
              {ROLE_ABBREV[role]}
            </span>
          ))}
        </div>
      </div>

      {/* Chief complaint sub-bar */}
      {basic.chiefComplaint && (
        <div className="px-4 py-1 bg-card border-t border-border-subtle flex items-center gap-2">
          <span className="text-2xs font-mono text-[#4a6b8a] uppercase tracking-widest flex-shrink-0">
            主訴
          </span>
          <span className="text-2xs font-mono text-text-secondary">{basic.chiefComplaint}</span>
        </div>
      )}
    </div>
  );
}
