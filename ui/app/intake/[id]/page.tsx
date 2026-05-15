"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getPatient, savePatient, saveSynthesis, buildCaseJson,
  PatientRecord, PhysicianData, NurseData, PharmacistData, MSWData, PTData,
  RoleKey, ROLE_KEYS, ROLE_LABELS, ROLE_ABBREV, completedRoles,
} from "../../lib/patientStore";

type TabId = "basic" | "physician" | "nurse" | "pharmacist" | "msw" | "pt";

// ── Field helpers ──────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">
      {children}{required && <span className="text-critical-text ml-1">*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:border-info-border transition-colors" />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:border-info-border transition-colors resize-none" />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-info-border transition-colors">
      {options.map((o) => <option key={o.value} value={o.value} className="bg-card">{o.label}</option>)}
    </select>
  );
}

function Toggle({ value, onChange, yes, no }: { value: boolean; onChange: (v: boolean) => void; yes: string; no: string }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-sm border transition-colors ${
        value ? "bg-ok-bg border-ok-border text-ok-text" : "bg-card border-border-subtle text-text-secondary"
      }`}>
      <span className={`w-3 h-3 rounded-full border ${value ? "bg-ok-text border-ok-text" : "border-text-tertiary"}`} />
      {value ? yes : no}
    </button>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function SaveButton({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <div className="flex justify-end pt-3 border-t border-border-subtle">
      <button onClick={onClick} disabled={saving}
        className={`px-5 py-2 rounded-sm font-mono text-xs font-semibold transition-colors ${
          saved ? "bg-ok-bg border border-ok-border text-ok-text" :
          "bg-info-bg border border-info-border text-info-text hover:bg-info/20"
        }`}>
        {saving ? "保存中…" : saved ? "✓ 保存済み" : "記録を保存"}
      </button>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PatientIntakePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("physician");
  const [saving, setSaving] = useState(false);
  const [savedTab, setSavedTab] = useState<TabId | null>(null);
  const [synthesizing, setSynthesizing] = useState(false);

  // Per-role form state
  const [physician, setPhysician] = useState<Omit<PhysicianData, "savedAt">>({
    primaryDx: "", secondaryDx: ["", "", ""], medications: "", keyLabs: "",
    currentBp: "", currentHr: "", currentSpo2: "", comorbidities: "",
    emergencyAdmission: false, edVisitsPrior6mo: "0",
    clinicalSummary: "", followUpPlan: "", safetyFlags: "",
  });

  const [nurse, setNurse] = useState<Omit<NurseData, "savedAt">>({
    educationReadiness: "conditional", educationBarriers: "",
    medicationComplexity: "moderate", injectionRequired: false, injectionEducationDone: false,
    adlStatus: "independent", adlConcerns: "",
    caregiverIdentified: false, caregiverName: "", caregiverAvailability: "",
    woundCareNeeds: "", warningSignsEducated: "", concerns: "",
  });

  const [pharmacist, setPharmacist] = useState<Omit<PharmacistData, "savedAt">>({
    reconciliationDone: false, highRiskMeds: "", drugInteractions: "",
    medsToStop: "", newMeds: "", allergies: "",
    insuranceCoverage: "full", patientUnderstanding: "partial",
    counselingDone: false, concerns: "",
  });

  const [msw, setMsw] = useState<Omit<MSWData, "savedAt">>({
    livingSituation: "alone", insurance: "insured", supportSystem: "moderate",
    transportationAccess: true, transportationNotes: "", housingStability: "stable",
    foodSecurity: "secure", financialConcerns: "", mentalHealthConcerns: "",
    substanceUse: "", resourcesArranged: "", homeHealthNeeded: false,
    followUpArranged: false, followUpDetails: "", concerns: "",
  });

  const [pt, setPt] = useState<Omit<PTData, "savedAt">>({
    priorFunctionalStatus: "", ambulation: "independent", transferStatus: "independent",
    fallRisk: "low", balanceImpaired: false, stairsAtHome: false, canManageStairs: true,
    equipmentNeeds: "", ptReferral: "none", rehabNeeded: false, concerns: "",
  });

  // Load patient + pre-fill forms from saved data
  useEffect(() => {
    const p = getPatient(id);
    if (!p) { router.push("/"); return; }
    setPatient(p);
    if (p.physician) setPhysician(p.physician);
    if (p.nurse)     setNurse(p.nurse);
    if (p.pharmacist) setPharmacist(p.pharmacist);
    if (p.msw)       setMsw(p.msw);
    if (p.pt)        setPt(p.pt);
  }, [id, router]);

  const saveRole = useCallback((tab: TabId) => {
    if (!patient) return;
    setSaving(true);
    const now = new Date().toISOString();
    const updated = { ...patient };
    if (tab === "physician") updated.physician = { ...physician, savedAt: now };
    if (tab === "nurse")     updated.nurse     = { ...nurse,     savedAt: now };
    if (tab === "pharmacist") updated.pharmacist = { ...pharmacist, savedAt: now };
    if (tab === "msw")       updated.msw       = { ...msw,       savedAt: now };
    if (tab === "pt")        updated.pt        = { ...pt,        savedAt: now };
    savePatient(updated);
    setPatient(updated);
    setSavedTab(tab);
    setSaving(false);
    setTimeout(() => setSavedTab(null), 2000);
  }, [patient, physician, nurse, pharmacist, msw, pt]);

  async function handleSynthesize() {
    if (!patient) return;
    setSynthesizing(true);
    try {
      const caseJson = buildCaseJson(patient);
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientData: caseJson }),
      });
      if (!res.ok) throw new Error("統合分析に失敗しました");
      const result = await res.json();
      result._intake_id = patient.id;
      result._intake_name = patient.basic.name;
      saveSynthesis(patient.id, result);
      router.push(`/patient/${patient.id}`);
    } catch (err) {
      console.error(err);
      alert("統合分析に失敗しました。API設定を確認してください。");
    } finally {
      setSynthesizing(false);
    }
  }

  if (!patient) {
    return <div className="py-20 text-center text-2xs font-mono uppercase tracking-widest text-text-tertiary animate-pulse">読み込み中…</div>;
  }

  const done = completedRoles(patient);
  const ph = (obj: Partial<typeof physician>) => setPhysician((p) => ({ ...p, ...obj }));
  const nu = (obj: Partial<typeof nurse>) => setNurse((p) => ({ ...p, ...obj }));
  const rx = (obj: Partial<typeof pharmacist>) => setPharmacist((p) => ({ ...p, ...obj }));
  const sw = (obj: Partial<typeof msw>) => setMsw((p) => ({ ...p, ...obj }));
  const ptu = (obj: Partial<typeof pt>) => setPt((p) => ({ ...p, ...obj }));

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">患者入力・作成中</div>
          <h1 className="text-xl font-mono font-semibold text-text-primary">{patient.basic.name}</h1>
          <div className="text-xs text-text-secondary mt-0.5">
            {patient.basic.age}{patient.basic.sex} · {patient.basic.chiefComplaint || "主訴未入力"}
          </div>
        </div>
        <Link href="/" className="text-2xs font-mono text-text-tertiary hover:text-text-secondary transition-colors">← 患者一覧</Link>
      </div>

      {/* Role completion status */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ROLE_KEYS.map((role) => {
          const isDone = done.includes(role);
          const saved = patient[role];
          return (
            <button key={role} onClick={() => setActiveTab(role as TabId)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono text-2xs uppercase tracking-wider transition-colors ${
                activeTab === role
                  ? "bg-info-bg border-info-border text-info-text"
                  : isDone
                  ? "bg-ok-bg border-ok-border text-ok-text"
                  : "bg-card border-border-subtle text-text-tertiary hover:border-border-hover"
              }`}>
              <span>{ROLE_ABBREV[role]}</span>
              {isDone && <span>✓</span>}
              {saved && <span className="text-2xs opacity-60">· {new Date(saved.savedAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>}
            </button>
          );
        })}
      </div>

      {/* Form panel */}
      <div className="bg-panel border border-border-subtle rounded-sm p-5 space-y-4">
        {/* Role header */}
        <div className="pb-2 border-b border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-2xs font-mono uppercase tracking-widest text-accent-text">
              {activeTab === "basic" ? "患者情報" : ROLE_LABELS[activeTab as keyof typeof ROLE_LABELS]}
            </div>
            <div className="text-xs text-text-secondary mt-0.5">
              {patient[activeTab as keyof PatientRecord] && typeof patient[activeTab as keyof PatientRecord] === "object"
                ? `最終保存: ${new Date((patient[activeTab as keyof PatientRecord] as { savedAt: string }).savedAt ?? patient.updatedAt).toLocaleString()}`
                : "未保存"}
            </div>
          </div>
          {done.includes(activeTab as RoleKey) && (
            <span className="text-2xs font-mono text-ok-text bg-ok-bg border border-ok-border px-2 py-0.5 rounded-sm">保存済み</span>
          )}
        </div>

        {/* ── BASIC (read-only summary) ── */}
        {activeTab === "basic" && (
          <div className="space-y-3">
            <div className="text-2xs font-mono text-text-tertiary">基本情報は作成時に設定されます。編集が必要な場合は作成者に確認してください。</div>
            {Object.entries(patient.basic).map(([k, v]) => v && (
              <div key={k} className="flex gap-3">
                <span className="text-2xs font-mono uppercase tracking-wider text-text-tertiary w-28 flex-shrink-0">{k.replace(/([A-Z])/g, " $1")}</span>
                <span className="text-xs font-mono text-text-primary">{String(v)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── PHYSICIAN ── */}
        {activeTab === "physician" && (
          <>
            <div>
              <Label required>主診断</Label>
              <Input value={physician.primaryDx} onChange={(v) => ph({ primaryDx: v })} placeholder="例: 心不全増悪（I50.9）" />
            </div>
            <div>
              <Label>副診断（最大3件）</Label>
              {[0,1,2].map((i) => (
                <div key={i} className="mb-1">
                  <Input value={physician.secondaryDx[i] ?? ""} onChange={(v) => { const d = [...physician.secondaryDx]; d[i] = v; ph({ secondaryDx: d }); }} placeholder={`副診断 ${i+1}`} />
                </div>
              ))}
            </div>
            <div>
              <Label>現在の処方</Label>
              <Textarea value={physician.medications} onChange={(v) => ph({ medications: v })} rows={4} placeholder="薬剤名・用量・経路・頻度。催奇形性や高リスク薬も記載。" />
            </div>
            <div><Label>主要検査値</Label><Textarea value={physician.keyLabs} onChange={(v) => ph({ keyLabs: v })} placeholder="例: HbA1c 11.4%, Cr 0.8, Na 136, pH 7.39" /></div>
            <Row>
              <div><Label>血圧</Label><Input value={physician.currentBp} onChange={(v) => ph({ currentBp: v })} placeholder="例: 122/78" /></div>
              <div><Label>心拍数</Label><Input value={physician.currentHr} onChange={(v) => ph({ currentHr: v })} placeholder="例: 80 bpm" /></div>
            </Row>
            <div><Label>SpO2</Label><Input value={physician.currentSpo2} onChange={(v) => ph({ currentSpo2: v })} placeholder="例: 98% RA" /></div>
            <Row>
              <div>
                <Label>救急入院ですか？</Label>
                <Toggle value={physician.emergencyAdmission} onChange={(v) => ph({ emergencyAdmission: v })} yes="はい・救急" no="いいえ・予定/緊急" />
              </div>
              <div>
                <Label>過去6か月の救急受診</Label>
                <Select value={physician.edVisitsPrior6mo} onChange={(v) => ph({ edVisitsPrior6mo: v })}
                  options={[{value:"0",label:"0"},{value:"1",label:"1"},{value:"2-3",label:"2–3"},{value:"4+",label:"4+"}]} />
              </div>
            </Row>
            <div><Label>併存疾患</Label><Textarea value={physician.comorbidities} onChange={(v) => ph({ comorbidities: v })} placeholder="糖尿病、心不全、COPD、CKD、悪性腫瘍など" /></div>
            <div><Label>臨床サマリー</Label><Textarea value={physician.clinicalSummary} onChange={(v) => ph({ clinicalSummary: v })} rows={4} placeholder="3〜5文: 入院経過と現在の状態" /></div>
            <div><Label>フォローアップ計画</Label><Textarea value={physician.followUpPlan} onChange={(v) => ph({ followUpPlan: v })} placeholder="診療科と時期" /></div>
            <div><Label>安全上の注意 / 重要課題</Label><Textarea value={physician.safetyFlags} onChange={(v) => ph({ safetyFlags: v })} placeholder="退院を遅らせる安全上の懸念" /></div>
            <SaveButton onClick={() => saveRole("physician")} saving={saving} saved={savedTab === "physician"} />
          </>
        )}

        {/* ── NURSE ── */}
        {activeTab === "nurse" && (
          <>
            <Row>
              <div><Label>教育準備状況</Label>
                <Select value={nurse.educationReadiness} onChange={(v) => nu({ educationReadiness: v })}
                  options={[{value:"ready",label:"準備済み"},{value:"conditional",label:"条件付き"},{value:"not_ready",label:"未準備"}]} />
              </div>
              <div><Label>服薬の複雑さ</Label>
                <Select value={nurse.medicationComplexity} onChange={(v) => nu({ medicationComplexity: v })}
                  options={[{value:"low",label:"低"},{value:"moderate",label:"中"},{value:"high",label:"高"},{value:"very_high",label:"非常に高い"}]} />
              </div>
            </Row>
            <div><Label>教育上の障壁</Label><Textarea value={nurse.educationBarriers} onChange={(v) => nu({ educationBarriers: v })} placeholder="言語、ヘルスリテラシー、認知、苦痛など" /></div>
            <Row>
              <div><Label>在宅注射が必要ですか？</Label><Toggle value={nurse.injectionRequired} onChange={(v) => nu({ injectionRequired: v })} yes="はい・必要" no="いいえ" /></div>
              {nurse.injectionRequired && <div><Label>注射指導</Label><Toggle value={nurse.injectionEducationDone} onChange={(v) => nu({ injectionEducationDone: v })} yes="完了" no="未完了" /></div>}
            </Row>
            <div><Label>ADL状況</Label>
              <Select value={nurse.adlStatus} onChange={(v) => nu({ adlStatus: v })}
                options={[{value:"independent",label:"自立"},{value:"minimal_assist",label:"軽介助"},{value:"moderate_assist",label:"中等度介助"},{value:"max_assist",label:"全介助に近い"},{value:"dependent",label:"依存"}]} />
            </div>
            <div><Label>ADL上の懸念</Label><Textarea value={nurse.adlConcerns} onChange={(v) => nu({ adlConcerns: v })} placeholder="入浴、更衣、移乗、排泄、食事など" /></div>
            <div><Label>介護者は確認済みですか？</Label><Toggle value={nurse.caregiverIdentified} onChange={(v) => nu({ caregiverIdentified: v })} yes="はい" no="介護者なし" /></div>
            {nurse.caregiverIdentified && (
              <Row>
                <div><Label>介護者名 / 続柄</Label><Input value={nurse.caregiverName} onChange={(v) => nu({ caregiverName: v })} placeholder="配偶者 / 子 / 介護職など" /></div>
                <div><Label>対応可能時間</Label><Input value={nurse.caregiverAvailability} onChange={(v) => nu({ caregiverAvailability: v })} placeholder="常時 / 平日のみなど" /></div>
              </Row>
            )}
            <div><Label>創傷 / デバイスケア</Label><Input value={nurse.woundCareNeeds} onChange={(v) => nu({ woundCareNeeds: v })} placeholder="毎日の処置、胃瘻、カテーテル、またはなし" /></div>
            <div><Label>注意徴候の説明</Label><Textarea value={nurse.warningSignsEducated} onChange={(v) => nu({ warningSignsEducated: v })} placeholder="体重増加2kg超、血糖目標、DKA徴候など" /></div>
            <div><Label>看護上の懸念</Label><Textarea value={nurse.concerns} onChange={(v) => nu({ concerns: v })} placeholder="安全面、患者の様子、フォローアップ上の不安" /></div>
            <SaveButton onClick={() => saveRole("nurse")} saving={saving} saved={savedTab === "nurse"} />
          </>
        )}

        {/* ── PHARMACIST ── */}
        {activeTab === "pharmacist" && (
          <>
            <Row>
              <div><Label>薬剤照合は完了？</Label><Toggle value={pharmacist.reconciliationDone} onChange={(v) => rx({ reconciliationDone: v })} yes="完了" no="未完了" /></div>
              <div><Label>服薬指導は完了？</Label><Toggle value={pharmacist.counselingDone} onChange={(v) => rx({ counselingDone: v })} yes="完了" no="未完了" /></div>
            </Row>
            <div><Label>薬物アレルギー</Label><Input value={pharmacist.allergies} onChange={(v) => rx({ allergies: v })} placeholder="ペニシリン・発疹、または既知なし" /></div>
            <div><Label>高リスク薬</Label><Textarea value={pharmacist.highRiskMeds} onChange={(v) => rx({ highRiskMeds: v })} placeholder="ワルファリン、インスリン、オピオイド、催奇形性薬など" /></div>
            <div><Label>薬物相互作用</Label><Textarea value={pharmacist.drugInteractions} onChange={(v) => rx({ drugInteractions: v })} placeholder="例: ワルファリン + アモキシシリン、またはなし" /></div>
            <div><Label>退院時に中止する薬</Label><Textarea value={pharmacist.medsToStop} onChange={(v) => rx({ medsToStop: v })} placeholder="点滴から内服へ移行する薬、催奇形性薬など" /></div>
            <div><Label>退院時の新規処方</Label><Textarea value={pharmacist.newMeds} onChange={(v) => rx({ newMeds: v })} placeholder="新規処方" /></div>
            <Row>
              <div><Label>保険カバー</Label>
                <Select value={pharmacist.insuranceCoverage} onChange={(v) => rx({ insuranceCoverage: v })}
                  options={[{value:"full",label:"十分"},{value:"partial",label:"一部・自己負担/不足あり"},{value:"none",label:"なし / 無保険"}]} />
              </div>
              <div><Label>患者理解度</Label>
                <Select value={pharmacist.patientUnderstanding} onChange={(v) => rx({ patientUnderstanding: v })}
                  options={[{value:"good",label:"良好"},{value:"partial",label:"一部理解"},{value:"poor",label:"不十分"}]} />
              </div>
            </Row>
            <div><Label>薬剤部門の懸念</Label><Textarea value={pharmacist.concerns} onChange={(v) => rx({ concerns: v })} placeholder="費用、複雑な処方、モニタリング必要性など" /></div>
            <SaveButton onClick={() => saveRole("pharmacist")} saving={saving} saved={savedTab === "pharmacist"} />
          </>
        )}

        {/* ── SOCIAL WORKER ── */}
        {activeTab === "msw" && (
          <>
            <Row>
              <div><Label>居住状況</Label>
                <Select value={msw.livingSituation} onChange={(v) => sw({ livingSituation: v })}
                  options={[{value:"alone",label:"独居"},{value:"with_spouse",label:"配偶者/パートナーと同居"},{value:"with_family",label:"家族と同居"},{value:"assisted_living",label:"介護付き住宅"},{value:"nursing_home",label:"施設入所"},{value:"homeless",label:"住居なし/不安定"}]} />
              </div>
              <div><Label>保険状況</Label>
                <Select value={msw.insurance} onChange={(v) => sw({ insurance: v })}
                  options={[{value:"insured",label:"民間保険あり"},{value:"medicare",label:"Medicare"},{value:"medicaid",label:"Medicaid"},{value:"medicaid_pending",label:"Medicaid申請中"},{value:"dual",label:"Medicare + Medicaid"},{value:"uninsured",label:"無保険"}]} />
              </div>
            </Row>
            <Row>
              <div><Label>支援体制</Label>
                <Select value={msw.supportSystem} onChange={(v) => sw({ supportSystem: v })}
                  options={[{value:"strong",label:"強い"},{value:"moderate",label:"中等度"},{value:"limited",label:"限定的"},{value:"none",label:"なし・孤立"}]} />
              </div>
              <div><Label>住居の安定性</Label>
                <Select value={msw.housingStability} onChange={(v) => sw({ housingStability: v })}
                  options={[{value:"stable",label:"安定"},{value:"at_risk",label:"リスクあり"},{value:"unstable",label:"不安定"},{value:"homeless",label:"住居なし"}]} />
              </div>
            </Row>
            <Row>
              <div><Label>食料確保</Label>
                <Select value={msw.foodSecurity} onChange={(v) => sw({ foodSecurity: v })}
                  options={[{value:"secure",label:"確保あり"},{value:"insecure",label:"不安あり"}]} />
              </div>
              <div><Label>交通手段</Label><Toggle value={msw.transportationAccess} onChange={(v) => sw({ transportationAccess: v })} yes="信頼できる交通手段あり" no="交通手段に課題あり" /></div>
            </Row>
            <div><Label>交通手段メモ</Label><Input value={msw.transportationNotes} onChange={(v) => sw({ transportationNotes: v })} placeholder="自家用車、公共交通、医療送迎が必要など" /></div>
            <div><Label>経済的懸念</Label><Textarea value={msw.financialConcerns} onChange={(v) => sw({ financialConcerns: v })} placeholder="薬剤費、自己負担、収入喪失など" /></div>
            <div><Label>メンタルヘルス上の懸念</Label><Input value={msw.mentalHealthConcerns} onChange={(v) => sw({ mentalHealthConcerns: v })} placeholder="抑うつ、不安、PTSD、または特になし" /></div>
            <div><Label>物質使用</Label><Input value={msw.substanceUse} onChange={(v) => sw({ substanceUse: v })} placeholder="喫煙、飲酒、薬物、または申告なし" /></div>
            <div><Label>手配済み地域資源</Label><Textarea value={msw.resourcesArranged} onChange={(v) => sw({ resourcesArranged: v })} placeholder="訪問看護、配食、患者支援、フードバンクなど" /></div>
            <Row>
              <div><Label>訪問看護は必要？</Label><Toggle value={msw.homeHealthNeeded} onChange={(v) => sw({ homeHealthNeeded: v })} yes="はい・手配済み" no="いいえ" /></div>
              <div><Label>フォローアップ手配済み？</Label><Toggle value={msw.followUpArranged} onChange={(v) => sw({ followUpArranged: v })} yes="はい・予約済み" no="未手配" /></div>
            </Row>
            {msw.followUpArranged && <div><Label>フォローアップ詳細</Label><Input value={msw.followUpDetails} onChange={(v) => sw({ followUpDetails: v })} placeholder="担当者、日付、場所、交通手段など" /></div>}
            <div><Label>MSWの懸念</Label><Textarea value={msw.concerns} onChange={(v) => sw({ concerns: v })} placeholder="未解決の障壁、安全上の課題、エスカレーション必要性" /></div>
            <SaveButton onClick={() => saveRole("msw")} saving={saving} saved={savedTab === "msw"} />
          </>
        )}

        {/* ── PT ── */}
        {activeTab === "pt" && (
          <>
            <div><Label>入院前の機能状態</Label><Textarea value={pt.priorFunctionalStatus} onChange={(v) => ptu({ priorFunctionalStatus: v })} placeholder="完全自立、1日1マイル歩行、普段から歩行器使用など" /></div>
            <Row>
              <div><Label>現在の歩行</Label>
                <Select value={pt.ambulation} onChange={(v) => ptu({ ambulation: v })}
                  options={[{value:"independent",label:"自立"},{value:"supervised",label:"見守り"},{value:"cane",label:"杖"},{value:"walker",label:"歩行器"},{value:"wheelchair",label:"車椅子（一部荷重）"},{value:"wheelchair_full",label:"車椅子（歩行不可）"},{value:"bedbound",label:"寝たきり"}]} />
              </div>
              <div><Label>移乗状況</Label>
                <Select value={pt.transferStatus} onChange={(v) => ptu({ transferStatus: v })}
                  options={[{value:"independent",label:"自立"},{value:"supervised",label:"見守り"},{value:"min_assist",label:"軽介助（25%）"},{value:"mod_assist",label:"中等度介助（50%）"},{value:"max_assist",label:"重度介助（75%）"},{value:"dependent",label:"全介助（100%）"}]} />
              </div>
            </Row>
            <Row>
              <div><Label>転倒リスク</Label>
                <Select value={pt.fallRisk} onChange={(v) => ptu({ fallRisk: v })}
                  options={[{value:"low",label:"低"},{value:"moderate",label:"中"},{value:"high",label:"高"}]} />
              </div>
              <div><Label>バランス障害あり？</Label><Toggle value={pt.balanceImpaired} onChange={(v) => ptu({ balanceImpaired: v })} yes="はい・障害あり" no="いいえ・保たれている" /></div>
            </Row>
            <Row>
              <div><Label>自宅に階段あり？</Label><Toggle value={pt.stairsAtHome} onChange={(v) => ptu({ stairsAtHome: v })} yes="はい" no="階段なし" /></div>
              {pt.stairsAtHome && <div><Label>階段対応可能？</Label><Toggle value={pt.canManageStairs} onChange={(v) => ptu({ canManageStairs: v })} yes="はい・確認済み" no="いいえ・障壁あり" /></div>}
            </Row>
            <div><Label>必要な福祉用具</Label><Textarea value={pt.equipmentNeeds} onChange={(v) => ptu({ equipmentNeeds: v })} placeholder="歩行器、手すり、シャワーチェア、ポータブルトイレ、またはなし" /></div>
            <Row>
              <div><Label>PT / OT紹介</Label>
                <Select value={pt.ptReferral} onChange={(v) => ptu({ ptReferral: v })}
                  options={[{value:"none",label:"不要"},{value:"outpatient_pt",label:"外来PT"},{value:"home_pt",label:"訪問PT"},{value:"outpatient_ot",label:"外来OT"},{value:"home_ot",label:"訪問OT"},{value:"both_pt_ot",label:"PT + OT"}]} />
              </div>
              <div><Label>リハビリ施設が必要？</Label><Toggle value={pt.rehabNeeded} onChange={(v) => ptu({ rehabNeeded: v })} yes="はい・SNF/IRF" no="いいえ・自宅" /></div>
            </Row>
            <div><Label>PTの懸念</Label><Textarea value={pt.concerns} onChange={(v) => ptu({ concerns: v })} placeholder="安全上の懸念、用具手配の遅れ、介護者トレーニングなど" /></div>
            <SaveButton onClick={() => saveRole("pt")} saving={saving} saved={savedTab === "pt"} />
          </>
        )}
      </div>

      {/* Synthesis footer */}
      <div className="mt-5 bg-panel border border-border-subtle rounded-sm p-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-mono text-text-secondary">
            保存済み職種:{" "}
            <span className={done.length >= 1 ? "text-ok-text" : "text-warning-text"}>
              {done.length} / 5
            </span>
            <span className="text-text-tertiary ml-2">({done.map((r) => ROLE_ABBREV[r]).join(", ") || "まだなし"})</span>
          </div>
          <div className="text-2xs text-text-tertiary mt-0.5">
            どの職種でも統合分析を実行できます。入力職種が多いほど分析精度が上がります。
          </div>
        </div>
        <button
          onClick={handleSynthesize}
          disabled={synthesizing || done.length === 0}
          className={`px-6 py-2.5 rounded-sm font-mono text-sm font-semibold transition-colors ${
            done.length > 0 && !synthesizing
              ? "bg-accent text-white hover:bg-accent/80"
              : "bg-card text-text-tertiary border border-border-subtle cursor-not-allowed"
          }`}
        >
          {synthesizing ? "統合分析中…" : "AI統合分析を実行 →"}
        </button>
      </div>
    </div>
  );
}
