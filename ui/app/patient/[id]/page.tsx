"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPatient, PatientRecord, ROLE_KEYS, ROLE_LABELS, ROLE_ABBREV } from "../../lib/patientStore";
import { PatientBanner } from "../../components/PatientBanner";
import { FindingRow } from "../../components/FindingRow";
import { priorityToSeverity } from "../../components/StatusPill";

type AnyRecord = Record<string, unknown>;
type SectionId =
  | "overview" | "problems" | "medications" | "vitals"
  | "nursing" | "pharmacy" | "socialwork" | "pt"
  | "discharge" | "handoff";

const CHART_SECTIONS: { id: SectionId; label: string; abbrev: string }[] = [
  { id: "overview",    label: "カルテ概要",       abbrev: "概" },
  { id: "problems",    label: "問題リスト",       abbrev: "診" },
  { id: "medications", label: "薬剤",             abbrev: "薬" },
  { id: "vitals",      label: "検査・バイタル",   abbrev: "検" },
  { id: "nursing",     label: "看護",             abbrev: "看" },
  { id: "pharmacy",    label: "薬剤部",           abbrev: "薬" },
  { id: "socialwork",  label: "ソーシャルワーク", abbrev: "SW" },
  { id: "pt",          label: "PT / OT",          abbrev: "PT" },
  { id: "discharge",   label: "退院計画",         abbrev: "退" },
  { id: "handoff",     label: "引き継ぎ",         abbrev: "引" },
];

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-2 border-b border-[#1e3a5f]">
      <div className="h-4 w-1 bg-[#1e56a0] rounded-full flex-shrink-0" />
      <h2 className="font-mono font-bold text-sm text-text-primary uppercase tracking-wide">{title}</h2>
      {count !== undefined && (
        <span className="text-2xs font-mono text-[#4a6b8a]">({count})</span>
      )}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value?: string | boolean | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-3 py-1.5 border-b border-border-subtle/30 last:border-0">
      <span className="text-2xs font-mono text-[#4a6b8a] uppercase w-44 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-xs font-mono text-text-primary">
        {typeof value === "boolean" ? (value ? "はい" : "いいえ") : value}
      </span>
    </div>
  );
}

function PendingSection({ id }: { id: string }) {
  return (
    <p className="text-sm font-mono text-text-tertiary">
      評価はまだ入力されていません。{" "}
      <Link href={`/intake/${id}`} className="text-[#5b9bd5] hover:underline">
        今すぐ入力 →
      </Link>
    </p>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<AnyRecord | null>(null);
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [section, setSection] = useState<SectionId>("overview");

  useEffect(() => {
    const raw = localStorage.getItem(`rounds_synthesis_${id}`);
    if (raw) setD(JSON.parse(raw));
    setPatient(getPatient(id));
    setLoaded(true);
  }, [id]);

  if (!loaded) {
    return (
      <div className="py-20 text-center">
        <span className="text-2xs font-mono text-text-tertiary animate-pulse">カルテを読み込み中…</span>
      </div>
    );
  }

  if (!patient && !d) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">
          患者が見つかりません
        </div>
        <p className="text-sm text-text-secondary">
          レコードが見つかりません。ブラウザ保存データが削除された可能性があります。
        </p>
        <Link href="/" className="text-[#5b9bd5] text-sm font-mono hover:underline">
          ← 患者一覧へ戻る
        </Link>
      </div>
    );
  }

  // ── In-progress: no synthesis yet ──────────────────────────────────────────
  if (!d && patient) {
    const completedRoles = ROLE_KEYS.filter((k) => patient[k] !== null);
    return (
      <div className="-mx-6 -mt-6">
        <PatientBanner patient={patient} synth={null} />
        <div className="max-w-2xl mx-auto py-8 px-6 space-y-5">
          <div className="bg-card border border-border-subtle rounded p-5">
            <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">
              カルテ状態
            </div>
            <p className="text-sm font-mono text-text-secondary">
              AI統合分析はまだ実行されていません。{" "}
              5職種中{completedRoles.length}職種が入力済みです。
            </p>
          </div>

          <div className="bg-panel border border-border-subtle rounded overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border-subtle bg-card flex items-center gap-2">
              <div className="h-3 w-0.5 bg-accent rounded-full" />
              <span className="text-2xs font-mono uppercase tracking-widest text-accent-text">
                ケアチーム記録
              </span>
            </div>
            {ROLE_KEYS.map((role) => {
              const done = patient[role] !== null;
              const roleData = patient[role] as AnyRecord | null;
              return (
                <div
                  key={role}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle/50 last:border-0"
                >
                  <span
                    className={`text-2xs font-mono w-10 text-center px-1 py-0.5 rounded border ${
                      done
                        ? "border-ok-border text-ok-text bg-ok-bg"
                        : "border-border-subtle text-text-tertiary"
                    }`}
                  >
                    {ROLE_ABBREV[role]}
                  </span>
                  <span className="text-xs font-mono text-text-primary flex-1">
                    {ROLE_LABELS[role]}
                  </span>
                  {done ? (
                    <span className="text-2xs font-mono text-ok-text">
                      記録済み{" "}
                      {roleData?.savedAt
                        ? new Date(roleData.savedAt as string).toLocaleTimeString()
                        : ""}
                    </span>
                  ) : (
                    <span className="text-2xs font-mono text-text-tertiary">未入力</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Link
              href={`/intake/${id}`}
              className="flex-1 text-center py-2.5 bg-[#1e3a5f] border border-[#1e56a0] text-[#5b9bd5] font-mono text-sm rounded hover:bg-[#1e56a0]/30 transition-colors"
            >
              {completedRoles.length === 0
                ? "記録を開始 →"
                : `入力を続ける（${completedRoles.length}/5）→`}
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 border border-border-subtle text-text-secondary font-mono text-sm rounded hover:border-border-hover transition-colors"
            >
              ← 一覧
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Full chart view with synthesis ─────────────────────────────────────────
  const ph = patient?.physician as AnyRecord | null;
  const rn = patient?.nurse as AnyRecord | null;
  const rx = patient?.pharmacist as AnyRecord | null;
  const sw = patient?.msw as AnyRecord | null;
  const ptData = patient?.pt as AnyRecord | null;

  const allActions = (d!.prioritized_actions ?? []) as AnyRecord[];
  const criticalActions = allActions.filter((a) => a.priority === "CRITICAL");

  const sectionsWithData = new Set<string>(["overview", "discharge"]);
  if (ph) { sectionsWithData.add("problems"); sectionsWithData.add("medications"); sectionsWithData.add("vitals"); }
  if (rn) sectionsWithData.add("nursing");
  if (rx) sectionsWithData.add("pharmacy");
  if (sw) sectionsWithData.add("socialwork");
  if (ptData) sectionsWithData.add("pt");
  if ((d!.handoff_packages as AnyRecord | undefined)?.patient_instructions) sectionsWithData.add("handoff");

  return (
    <div className="-mx-6 -mt-6">
      <PatientBanner patient={patient!} synth={d} />

      <div className="flex" style={{ minHeight: "calc(100vh - 110px)" }}>
        {/* ── Epic-style left sidebar ── */}
        <aside className="w-48 bg-white border-r border-border-subtle flex-shrink-0 overflow-y-auto">
          <div className="py-2">
            <div className="px-3 pt-3 pb-2 text-2xs font-mono uppercase tracking-widest text-[#4a6b8a]">
              カルテメニュー
            </div>
            {CHART_SECTIONS.map((s) => {
              const isActive = section === s.id;
              const hasData = sectionsWithData.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors border-l-2 ${
                    isActive
                      ? "bg-accent-bg text-accent-text border-accent"
                      : "text-text-secondary hover:bg-card border-transparent"
                  }`}
                >
                  <span
                    className={`text-2xs font-mono w-8 flex-shrink-0 ${
                      hasData
                        ? isActive ? "text-accent-text" : "text-info-text"
                        : "text-text-tertiary"
                    }`}
                  >
                    {s.abbrev}
                  </span>
                  <span className="text-xs font-mono flex-1">{s.label}</span>
                  {hasData && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Main content area ── */}
        <main className="flex-1 overflow-y-auto p-6 bg-base">

          {/* OVERVIEW */}
          {section === "overview" && (
            <div className="space-y-5 max-w-3xl">
              <SectionHeader title="カルテ概要" />

              {/* Key metric cards */}
              {(() => {
                const readiness = String(d!.discharge_readiness ?? "");
                const laceTotal = (d!.lace_score as AnyRecord)?.total;
                const risk = (d!.readmission_risk_30d as AnyRecord)?.score_pct;
                const cards = [
                  {
                    label: "退院状態",
                    value: readiness === "ready" ? "退院可" : readiness === "conditional" ? "条件付き" : "未準備",
                    cls: readiness === "ready" ? "text-ok-text" : readiness === "conditional" ? "text-warning-text" : "text-critical-text",
                  },
                  { label: "LACEスコア", value: laceTotal !== undefined ? String(laceTotal) : "—", cls: "text-warning-text" },
                  { label: "30日再入院リスク", value: risk !== undefined ? `${String(risk)}%` : "—", cls: "text-warning-text" },
                ];
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {cards.map((card) => (
                      <div key={card.label} className="bg-card border border-border-subtle rounded p-4">
                        <div className="text-2xs font-mono text-[#4a6b8a] uppercase tracking-widest mb-1">{card.label}</div>
                        <div className={`font-mono font-bold text-2xl tabular-nums ${card.cls}`}>{card.value}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Rationale */}
              {!!d!.discharge_readiness_rationale && (
                <div className="bg-card border border-border-subtle rounded p-4">
                  <div className="text-2xs font-mono uppercase tracking-widest text-[#4a6b8a] mb-2">
                    退院準備状況の根拠
                  </div>
                  <p className="text-sm font-mono text-[#a8c4e0] leading-relaxed">
                    {String(d!.discharge_readiness_rationale)}
                  </p>
                </div>
              )}

              {/* Critical actions */}
              {criticalActions.length > 0 && (
                <div>
                  <div className="text-2xs font-mono uppercase tracking-widest text-critical-text mb-2">
                    必要な重要アクション（{criticalActions.length}件）
                  </div>
                  <div className="border border-critical-border/40 rounded overflow-hidden">
                    {criticalActions.map((a, i) => (
                      <FindingRow
                        key={i}
                        severity="critical"
                        label="重要"
                        description={a.action as string}
                        source={a.owner as string}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick nav hints */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {CHART_SECTIONS.filter((s) => s.id !== "overview").map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    className={`text-left px-3 py-2 rounded border flex items-center gap-2 transition-colors ${
                      sectionsWithData.has(s.id)
                        ? "border-border-subtle bg-card hover:bg-accent-bg text-accent-text"
                        : "border-border-subtle/30 text-text-tertiary"
                    }`}
                  >
                    <span className="text-2xs font-mono w-8 text-[#4a6b8a]">{s.abbrev}</span>
                    <span className="text-xs font-mono">{s.label}</span>
                    {sectionsWithData.has(s.id) && (
                      <span className="ml-auto text-2xs text-ok-text">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PROBLEM LIST */}
          {section === "problems" && (
            <div className="space-y-4 max-w-3xl">
              <SectionHeader title="問題リスト" />
              {ph ? (
                <>
                  <div className="bg-panel border border-border-subtle rounded overflow-hidden">
                    <div className="px-4 py-2 bg-card border-b border-border-subtle flex items-center gap-2">
                      <span className="text-2xs font-mono text-[#5b9bd5] uppercase">主診断</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="font-mono text-sm text-text-primary font-semibold">
                        {ph.primaryDx as string || "—"}
                      </span>
                    </div>
                  </div>

                  {(ph.secondaryDx as string[])?.filter(Boolean).length > 0 && (
                    <div className="bg-panel border border-border-subtle rounded overflow-hidden">
                      <div className="px-4 py-2 bg-card border-b border-border-subtle">
                        <span className="text-2xs font-mono text-[#5b9bd5] uppercase">副診断</span>
                      </div>
                      <div className="divide-y divide-border-subtle/50">
                        {(ph.secondaryDx as string[]).filter(Boolean).map((dx, i) => (
                          <div key={i} className="px-4 py-2 flex items-center gap-3">
                            <span className="text-2xs font-mono text-[#4a6b8a] w-5">{i + 1}.</span>
                            <span className="text-sm font-mono text-text-primary">{dx}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <DataRow label="併存疾患" value={ph.comorbidities as string} />
                  {ph.clinicalSummary && (
                    <div className="bg-panel border border-border-subtle rounded p-4">
                      <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">臨床サマリー</div>
                      <p className="text-sm font-mono text-text-primary leading-relaxed whitespace-pre-wrap">
                        {ph.clinicalSummary as string}
                      </p>
                    </div>
                  )}
                  <DataRow label="フォローアップ計画" value={ph.followUpPlan as string} />
                  <DataRow label="安全上の注意" value={ph.safetyFlags as string} />
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* MEDICATIONS */}
          {section === "medications" && (
            <div className="space-y-4 max-w-3xl">
              <SectionHeader title="薬剤" />
              {ph ? (
                <>
                  <div className="bg-panel border border-border-subtle rounded p-4">
                    <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">現在の処方一覧</div>
                    <p className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                      {ph.medications as string || "—"}
                    </p>
                  </div>

                  {rx && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-panel border border-border-subtle rounded p-4">
                          <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">
                            薬剤照合
                          </div>
                          <span
                            className={`text-2xs font-mono px-2 py-0.5 rounded border ${
                              rx.reconciliationDone
                                ? "border-ok-border text-ok-text bg-ok-bg"
                                : "border-warning-border text-warning-text bg-warning-bg"
                            }`}
                          >
                            {rx.reconciliationDone ? "完了" : "未完了"}
                          </span>
                        </div>
                        <div className="bg-panel border border-border-subtle rounded p-4">
                          <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">
                            服薬指導
                          </div>
                          <span
                            className={`text-2xs font-mono px-2 py-0.5 rounded border ${
                              rx.counselingDone
                                ? "border-ok-border text-ok-text bg-ok-bg"
                                : "border-warning-border text-warning-text bg-warning-bg"
                            }`}
                          >
                            {rx.counselingDone ? "完了" : "未完了"}
                          </span>
                        </div>
                      </div>

                      {rx.highRiskMeds && (
                        <div className="bg-critical-bg border border-critical-border rounded p-4">
                          <div className="text-2xs font-mono text-critical-text uppercase mb-1">
                            高リスク薬
                          </div>
                          <p className="text-sm font-mono text-text-primary">{rx.highRiskMeds as string}</p>
                        </div>
                      )}
                      {rx.drugInteractions && (
                        <div className="bg-warning-bg border border-warning-border rounded p-4">
                          <div className="text-2xs font-mono text-warning-text uppercase mb-1">
                            薬物相互作用
                          </div>
                          <p className="text-sm font-mono text-text-primary">{rx.drugInteractions as string}</p>
                        </div>
                      )}
                      <DataRow label="中止予定薬" value={rx.medsToStop as string} />
                      <DataRow label="退院時新規薬" value={rx.newMeds as string} />
                      <DataRow label="アレルギー / ADR" value={rx.allergies as string} />
                      <DataRow label="保険カバー" value={rx.insuranceCoverage as string} />
                      <DataRow label="患者理解度" value={rx.patientUnderstanding as string} />
                    </>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* LABS & VITALS */}
          {section === "vitals" && (
            <div className="space-y-4 max-w-3xl">
              <SectionHeader title="検査・バイタル" />
              {ph ? (
                <>
                  <div className="bg-panel border border-border-subtle rounded overflow-hidden">
                    <div className="px-4 py-2 bg-card border-b border-border-subtle">
                      <span className="text-2xs font-mono text-[#5b9bd5] uppercase">現在のバイタル</span>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-border-subtle">
                      {[
                        { label: "血圧", value: ph.currentBp as string, unit: "mmHg" },
                        { label: "心拍数", value: ph.currentHr as string, unit: "bpm" },
                        { label: "SpO₂", value: ph.currentSpo2 as string, unit: "%" },
                      ].map(({ label, value, unit }) => (
                        <div key={label} className="px-4 py-4 text-center">
                          <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-1">{label}</div>
                          <div className="font-mono text-2xl font-bold text-text-primary tabular-nums">
                            {value || "—"}
                          </div>
                          {value && (
                            <div className="text-2xs font-mono text-[#4a6b8a] mt-0.5">{unit}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {ph.keyLabs && (
                    <div className="bg-panel border border-border-subtle rounded p-4">
                      <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">主要検査値</div>
                      <p className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                        {ph.keyLabs as string}
                      </p>
                    </div>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* NURSING */}
          {section === "nursing" && (
            <div className="space-y-1 max-w-3xl">
              <SectionHeader title="看護評価" />
              {rn ? (
                <>
                  <DataRow label="教育準備状況" value={rn.educationReadiness as string} />
                  <DataRow label="教育上の障壁" value={rn.educationBarriers as string} />
                  <DataRow label="服薬の複雑さ" value={rn.medicationComplexity as string} />
                  <DataRow label="注射必要" value={rn.injectionRequired as boolean} />
                  <DataRow label="注射指導完了" value={rn.injectionEducationDone as boolean} />
                  <DataRow label="ADL状況" value={rn.adlStatus as string} />
                  <DataRow label="ADL上の懸念" value={rn.adlConcerns as string} />
                  <DataRow label="介護者確認済み" value={rn.caregiverIdentified as boolean} />
                  {rn.caregiverIdentified && (
                    <>
                      <DataRow label="介護者名" value={rn.caregiverName as string} />
                      <DataRow label="介護者対応可能時間" value={rn.caregiverAvailability as string} />
                    </>
                  )}
                  <DataRow label="創傷ケア必要性" value={rn.woundCareNeeds as string} />
                  <DataRow label="注意徴候の説明" value={rn.warningSignsEducated as string} />
                  {rn.concerns && (
                    <div className="bg-warning-bg border border-warning-border rounded p-3 mt-3">
                      <div className="text-2xs font-mono text-warning-text uppercase mb-1">看護上の懸念</div>
                      <p className="text-sm font-mono text-text-primary">{rn.concerns as string}</p>
                    </div>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* PHARMACY */}
          {section === "pharmacy" && (
            <div className="space-y-1 max-w-3xl">
              <SectionHeader title="薬剤評価" />
              {rx ? (
                <>
                  <DataRow label="薬剤照合完了" value={rx.reconciliationDone as boolean} />
                  <DataRow label="高リスク薬" value={rx.highRiskMeds as string} />
                  <DataRow label="薬物相互作用" value={rx.drugInteractions as string} />
                  <DataRow label="中止予定薬" value={rx.medsToStop as string} />
                  <DataRow label="退院時新規薬" value={rx.newMeds as string} />
                  <DataRow label="アレルギー / ADR" value={rx.allergies as string} />
                  <DataRow label="保険カバー" value={rx.insuranceCoverage as string} />
                  <DataRow label="患者理解度" value={rx.patientUnderstanding as string} />
                  <DataRow label="服薬指導完了" value={rx.counselingDone as boolean} />
                  {rx.concerns && (
                    <div className="bg-warning-bg border border-warning-border rounded p-3 mt-3">
                      <div className="text-2xs font-mono text-warning-text uppercase mb-1">薬剤部門の懸念</div>
                      <p className="text-sm font-mono text-text-primary">{rx.concerns as string}</p>
                    </div>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* SOCIAL WORK */}
          {section === "socialwork" && (
            <div className="space-y-1 max-w-3xl">
              <SectionHeader title="ソーシャルワーク評価" />
              {sw ? (
                <>
                  <DataRow label="居住状況" value={sw.livingSituation as string} />
                  <DataRow label="保険" value={sw.insurance as string} />
                  <DataRow label="支援体制" value={sw.supportSystem as string} />
                  <DataRow label="交通手段" value={sw.transportationAccess as boolean} />
                  <DataRow label="交通手段メモ" value={sw.transportationNotes as string} />
                  <DataRow label="住居の安定性" value={sw.housingStability as string} />
                  <DataRow label="食料確保" value={sw.foodSecurity as string} />
                  <DataRow label="経済的懸念" value={sw.financialConcerns as string} />
                  <DataRow label="メンタルヘルス" value={sw.mentalHealthConcerns as string} />
                  <DataRow label="物質使用" value={sw.substanceUse as string} />
                  <DataRow label="手配済み資源" value={sw.resourcesArranged as string} />
                  <DataRow label="訪問看護必要" value={sw.homeHealthNeeded as boolean} />
                  <DataRow label="フォローアップ手配済み" value={sw.followUpArranged as boolean} />
                  <DataRow label="フォローアップ詳細" value={sw.followUpDetails as string} />
                  {sw.concerns && (
                    <div className="bg-warning-bg border border-warning-border rounded p-3 mt-3">
                      <div className="text-2xs font-mono text-warning-text uppercase mb-1">MSWの懸念</div>
                      <p className="text-sm font-mono text-text-primary">{sw.concerns as string}</p>
                    </div>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* PT / OT */}
          {section === "pt" && (
            <div className="space-y-1 max-w-3xl">
              <SectionHeader title="理学療法評価" />
              {ptData ? (
                <>
                  <DataRow label="入院前機能" value={ptData.priorFunctionalStatus as string} />
                  <DataRow label="歩行" value={ptData.ambulation as string} />
                  <DataRow label="移乗状況" value={ptData.transferStatus as string} />
                  <DataRow label="転倒リスク" value={ptData.fallRisk as string} />
                  <DataRow label="バランス障害" value={ptData.balanceImpaired as boolean} />
                  <DataRow label="自宅階段" value={ptData.stairsAtHome as boolean} />
                  <DataRow label="階段対応可能" value={ptData.canManageStairs as boolean} />
                  <DataRow label="必要な福祉用具" value={ptData.equipmentNeeds as string} />
                  <DataRow label="PT紹介" value={ptData.ptReferral as string} />
                  <DataRow label="リハビリ施設必要" value={ptData.rehabNeeded as boolean} />
                  {ptData.concerns && (
                    <div className="bg-warning-bg border border-warning-border rounded p-3 mt-3">
                      <div className="text-2xs font-mono text-warning-text uppercase mb-1">PTの懸念</div>
                      <p className="text-sm font-mono text-text-primary">{ptData.concerns as string}</p>
                    </div>
                  )}
                </>
              ) : <PendingSection id={id} />}
            </div>
          )}

          {/* DISCHARGE PLAN */}
          {section === "discharge" && (
            <div className="space-y-5 max-w-3xl">
              <SectionHeader title="退院計画" count={allActions.length} />

              {((d!.conflicts ?? []) as AnyRecord[]).length > 0 && (
                <div>
                  <div className="text-2xs font-mono uppercase tracking-widest text-warning-text mb-2">
                    臨床上の対立点
                  </div>
                  <div className="border border-border-subtle rounded overflow-hidden">
                    {((d!.conflicts ?? []) as AnyRecord[]).map((c, i) => (
                      <FindingRow
                        key={i}
                        severity="warning"
                        label="対立"
                        description={c.summary as string}
                        source={(c.positions as AnyRecord[])?.map((p) => p.holder).join(" · ")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {((d!.gaps ?? []) as AnyRecord[]).length > 0 && (
                <div>
                  <div className="text-2xs font-mono uppercase tracking-widest text-[#5b9bd5] mb-2">
                    記録ギャップ
                  </div>
                  <div className="border border-border-subtle rounded overflow-hidden">
                    {((d!.gaps ?? []) as AnyRecord[]).map((g, i) => (
                      <FindingRow
                        key={i}
                        severity="moderate"
                        label="ギャップ"
                        description={g.summary as string}
                        source={g.owner as string}
                      />
                    ))}
                  </div>
                </div>
              )}

              {allActions.length > 0 && (
                <div>
                  <div className="text-2xs font-mono uppercase tracking-widest text-[#4a6b8a] mb-2">
                    優先アクション項目
                  </div>
                  <div className="border border-border-subtle rounded overflow-hidden">
                    {allActions.map((a, i) => (
                      <FindingRow
                        key={i}
                        severity={priorityToSeverity(a.priority as string)}
                        label={a.priority as string}
                        description={a.action as string}
                        source={a.owner as string}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!!ph?.followUpPlan && (
                <div className="bg-panel border border-border-subtle rounded p-4">
                  <div className="text-2xs font-mono text-[#4a6b8a] uppercase mb-2">フォローアップ計画</div>
                  <p className="text-sm font-mono text-text-primary leading-relaxed">
                    {String(ph.followUpPlan)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* HANDOFF PACKAGES */}
          {section === "handoff" && (
            <div className="space-y-5 max-w-3xl">
              <SectionHeader title="引き継ぎパッケージ" />

              {(d!.conference_agenda as AnyRecord[])?.length > 0 && (
                <div className="bg-panel border border-border-subtle rounded overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border-subtle bg-card flex items-center gap-2">
                    <div className="h-3 w-0.5 bg-[#1e56a0] rounded-full" />
                    <span className="text-2xs font-mono uppercase text-[#7bafd4]">
                      カンファレンス議題
                    </span>
                  </div>
                  {(d!.conference_agenda as AnyRecord[]).map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 px-4 py-2.5 border-b border-border-subtle/50 last:border-0"
                    >
                      <span className="font-mono text-2xs text-[#4a6b8a] w-8 flex-shrink-0 pt-0.5">
                        {item.time_minutes as number}m
                      </span>
                      <div>
                        <span className="text-xs text-[#5b9bd5] font-mono">
                          {item.presenting_role as string}
                        </span>
                        <span className="text-xs text-text-primary"> — {item.agenda_item as string}</span>
                        {!!item.key_question && (
                          <p className="text-2xs text-text-secondary mt-0.5 italic">
                            {String(item.key_question)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!!(d!.handoff_packages as AnyRecord | undefined)?.patient_instructions && (
                <div className="bg-panel border border-border-subtle rounded p-4">
                  <div className="text-2xs font-mono uppercase text-[#4a6b8a] mb-3">
                    患者向け退院説明
                  </div>
                  <p className="text-sm font-mono text-text-primary leading-relaxed whitespace-pre-wrap">
                    {String((d!.handoff_packages as AnyRecord).patient_instructions)}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-2xs font-mono text-[#4a6b8a] pt-2 border-t border-border-subtle">
                <span>モデル: {(d!.meta as AnyRecord | undefined)?.model as string ?? "claude-opus-4-7"}</span>
                <span>信頼度: {(d!.meta as AnyRecord | undefined)?.synthesis_confidence as string}</span>
                <span>
                  統合日時:{" "}
                  {d!.synthesis_timestamp
                    ? new Date(d!.synthesis_timestamp as string).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
          )}

          {/* Bottom nav */}
          <div className="flex gap-4 mt-10 pt-4 border-t border-border-subtle">
            <Link href="/" className="text-[#5b9bd5] font-mono text-xs hover:underline">
              ← 患者一覧
            </Link>
            <Link href={`/intake/${id}`} className="text-[#5b9bd5] font-mono text-xs hover:underline">
              カルテ編集 →
            </Link>
            <Link href="/intake" className="text-[#5b9bd5] font-mono text-xs hover:underline">
              + 新規患者
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
