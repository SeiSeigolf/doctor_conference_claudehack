"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPatientIds, getPatient, deletePatient, PatientRecord, ROLE_ABBREV, ROLE_KEYS } from "./lib/patientStore";

interface SynthesisMeta {
  discharge_readiness?: string;
  lace_score?: { total: number; tier: string };
  readmission_risk_30d?: { score_pct: number };
}

function readinessCls(r?: string) {
  if (r === "ready")       return "bg-ok-bg text-ok-text border-ok-border";
  if (r === "conditional") return "bg-warning-bg text-warning-text border-warning-border";
  return "bg-critical-bg text-critical-text border-critical-border";
}

function readinessLabel(r?: string) {
  if (r === "ready")       return "退院可";
  if (r === "conditional") return "条件付き";
  return "未準備";
}

export default function LocalPatients() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);

  useEffect(() => {
    const ids = getAllPatientIds();
    const records = ids.map((id) => getPatient(id)).filter(Boolean) as PatientRecord[];
    setPatients(records);
  }, []);

  function handleClearAll() {
    patients.forEach((p) => deletePatient(p.id));
    setPatients([]);
  }

  if (patients.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">
          入力済み患者・{patients.length}件
        </div>
        <button
          onClick={handleClearAll}
          className="text-2xs font-mono text-text-tertiary hover:text-critical-text transition-colors"
        >
          すべて削除
        </button>
      </div>

      <div className="space-y-2">
        {patients.map((p) => {
          const synth = (() => {
            const raw = localStorage.getItem(`rounds_synthesis_${p.id}`);
            return raw ? (JSON.parse(raw) as SynthesisMeta) : null;
          })();

          const completedRoles = ROLE_KEYS.filter((k) => p[k] !== null);
          const href = synth ? `/patient/${p.id}` : `/intake/${p.id}`;

          return (
            <Link href={href} key={p.id} className="block group">
              <div className="bg-panel border border-border-subtle hover:border-border-hover rounded-sm transition-colors">
                <div className="flex items-center gap-4 px-4 py-3 flex-wrap">
                  {/* ID */}
                  <div className="flex items-center gap-2 flex-shrink-0 w-36">
                    <span className="font-mono text-2xs text-text-tertiary">
                      {p.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-2xs font-mono px-1.5 py-0.5 rounded-sm border border-accent-border text-accent-text bg-accent-bg">
                      新規
                    </span>
                  </div>

                  {/* Name + complaint */}
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-semibold text-text-primary">
                      {p.basic.name || "氏名未入力"}
                    </div>
                    <div className="text-2xs text-text-secondary mt-0.5">
                      {p.basic.age && `${p.basic.age}${p.basic.sex ? p.basic.sex : ""} · `}
                      {p.basic.chiefComplaint
                        ? p.basic.chiefComplaint.slice(0, 80)
                        : "主訴未入力"}
                    </div>
                  </div>

                  {/* Role completion badges */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {ROLE_KEYS.map((role) => {
                      const done = completedRoles.includes(role);
                      return (
                        <span
                          key={role}
                          className={`text-2xs font-mono px-1.5 py-0.5 rounded-sm border ${
                            done
                              ? "border-ok-border text-ok-text bg-ok-bg"
                              : "border-border-subtle text-text-tertiary"
                          }`}
                        >
                          {ROLE_ABBREV[role]}
                        </span>
                      );
                    })}
                  </div>

                  {/* Synthesis results if available */}
                  {synth ? (
                    <div className="flex items-center gap-4 flex-shrink-0 flex-wrap">
                      {synth.lace_score && (
                        <div className="text-right">
                          <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">LACE</div>
                          <div className="font-mono text-2xl font-semibold tabular-nums text-warning-text">
                            {synth.lace_score.total}
                          </div>
                        </div>
                      )}
                      {synth.readmission_risk_30d?.score_pct !== undefined && (
                        <div className="text-right">
                          <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">30日</div>
                          <div className="font-mono text-base font-semibold tabular-nums text-warning-text">
                            {synth.readmission_risk_30d.score_pct}%
                          </div>
                        </div>
                      )}
                      <span className={`text-2xs font-mono uppercase tracking-widest px-2 py-1 rounded-sm border ${readinessCls(synth.discharge_readiness)}`}>
                        {readinessLabel(synth.discharge_readiness)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xs font-mono text-text-tertiary border border-border-subtle px-2 py-1 rounded-sm">
                      {completedRoles.length === 0 ? "入力待ち" : `${completedRoles.length}/5職種・追加入力`}
                    </span>
                  )}

                  <span className="text-text-tertiary text-xs font-mono group-hover:text-text-secondary transition-colors">→</span>
                </div>

                <div className="px-4 pb-2 border-t border-border-subtle/50 pt-1.5">
                  <span className="text-2xs text-text-tertiary font-mono">
                    入力日時 {new Date(p.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
