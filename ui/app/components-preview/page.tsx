// Preview page — shows all shared components in all states
// Route: /components-preview  (remove before production)

import { StatusPill, Severity } from "../components/StatusPill";
import { MetricDisplay } from "../components/MetricDisplay";
import { AgentCard, AgentStatus } from "../components/AgentCard";
import { FindingRow } from "../components/FindingRow";

const SEVERITIES: Severity[] = ["critical", "warning", "moderate", "ok", "info", "accent", "neutral"];
const AGENT_STATUSES: AgentStatus[] = ["QUEUED", "ANALYZING", "COMPLETE", "ERROR"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-4 pb-2 border-b border-border-subtle">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function ComponentsPreviewPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-2 py-4">
      <h1 className="font-mono text-lg font-semibold text-text-primary mb-2">
        コンポーネント一覧
      </h1>
      <p className="text-xs text-text-tertiary mb-8 font-mono">
        ROUNDS.ai・デザインシステムプレビュー・全状態
      </p>

      {/* ── StatusPill ── */}
      <Section title="状態ピル・全重要度（ドットなし）">
        <div className="flex flex-wrap gap-2">
          {SEVERITIES.map((s) => (
            <StatusPill key={s} severity={s} label={s.toUpperCase()} />
          ))}
        </div>
      </Section>

      <Section title="状態ピル・ドットあり">
        <div className="flex flex-wrap gap-2">
          {SEVERITIES.map((s) => (
            <StatusPill key={s} severity={s} label={s.toUpperCase()} dot />
          ))}
        </div>
      </Section>

      <Section title="状態ピル・医療ラベル">
        <div className="flex flex-wrap gap-2">
          <StatusPill severity="critical" label="至急" dot />
          <StatusPill severity="critical" label="催奇形性" dot />
          <StatusPill severity="critical" label="未準備" />
          <StatusPill severity="warning"  label="高リスク" dot />
          <StatusPill severity="warning"  label="対立" />
          <StatusPill severity="moderate" label="中等度" dot />
          <StatusPill severity="ok"       label="確認済み" dot />
          <StatusPill severity="ok"       label="退院可" />
          <StatusPill severity="info"     label="分析中" dot />
          <StatusPill severity="accent"   label="統合役" dot />
          <StatusPill severity="neutral"  label="待機中" />
          <StatusPill severity="neutral"  label="ギャップ" />
        </div>
      </Section>

      {/* ── MetricDisplay ── */}
      <Section title="メトリック表示・サイズと重要度">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricDisplay value="13"    label="LACEスコア"          sublabel="非常に高い"       severity="critical" size="lg" />
          <MetricDisplay value="38%"   label="30日再入院"          sublabel="LACE・補正済み" severity="critical" size="md" />
          <MetricDisplay value="10"    label="LACEスコア"          sublabel="中〜高"        severity="warning"  size="lg" />
          <MetricDisplay value="22%"   label="30日再入院"          sublabel="LACE・補正済み" severity="warning"  size="md" />
          <MetricDisplay value="12"    label="LACEスコア"          sublabel="高"            severity="warning"  size="lg" />
          <MetricDisplay value="5"     label="LACEスコア"          sublabel="低"             severity="ok"       size="lg" />
          <MetricDisplay value="未準備" label="退院"       severity="critical" size="sm" />
          <MetricDisplay value="退院可" label="退院"       severity="ok"       size="sm" />
        </div>
      </Section>

      {/* ── AgentCard ── */}
      <Section title="エージェントカード・全状態">
        <div className="grid grid-cols-2 gap-3">
          {AGENT_STATUSES.map((status) => (
            <AgentCard
              key={status}
              role="physician"
              label="医師"
              status={status}
              highlights={
                status === "COMPLETE"
                  ? [
                      "リシノプリルは催奇形性あり・直ちに中止",
                      "妊娠に合わせたインスリン調整が必要",
                      "MFM紹介が未手配",
                    ]
                  : []
              }
            />
          ))}
        </div>
      </Section>

      <Section title="エージェントカード・5職種（完了）">
        <div className="grid grid-cols-1 gap-2">
          {[
            { role: "physician",  label: "医師",        highlights: ["リシノプリル10mg・催奇形性あり、処方継続中", "アトルバスタチン20mg・催奇形性あり、未中止"] },
            { role: "nurse",      label: "看護師",      highlights: ["患者が現在薬の妊娠への影響を理解していない", "グルカゴンキット未準備、介護者未指導"] },
            { role: "pharmacist", label: "薬剤師",      highlights: ["催奇形性薬2剤が有効処方: リシノプリル + アトルバスタチン", "インスリン費用: 小売で月$500-700、患者は無保険"] },
            { role: "msw",        label: "MSW",         highlights: ["無保険、Medicaid申請中・迅速化が必要", "独居で介護者未確認"] },
            { role: "pt",         label: "理学療法",    highlights: ["退院可能な機能状態、移動面の障壁なし"] },
          ].map((a) => (
            <AgentCard key={a.role} role={a.role} label={a.label} status="COMPLETE" highlights={a.highlights} />
          ))}
        </div>
      </Section>

      <Section title="エージェントカード・統合役の状態">
        <div className="grid grid-cols-2 gap-3">
          <AgentCard role="orchestrator" label="統合役・OPUS 4.7" status="ANALYZING" isOrchestrator />
          <AgentCard
            role="orchestrator"
            label="統合役・OPUS 4.7"
            status="COMPLETE"
            isOrchestrator
            highlights={["催奇形性薬2剤が有効処方", "LACE 13・30日再入院リスク38%", "未準備・重要アクション6件が必要"]}
          />
        </div>
      </Section>

      {/* ── FindingRow ── */}
      <Section title="所見行・フィード">
        <div className="bg-card border border-border-subtle rounded-sm overflow-hidden">
          <FindingRow
            severity="critical"
            label="至急"
            description="リシノプリル10mgが有効処方。カテゴリーDの催奇形性薬。妊娠7週が確認済み。直ちに中止し、メチルドパまたはラベタロールへ変更。"
            source="薬剤師・医師"
            pinned
          />
          <FindingRow
            severity="critical"
            label="至急"
            description="アトルバスタチン20mgが有効処方。カテゴリーXの催奇形性薬。退院前に中止し、脂質管理は産後に延期。"
            source="薬剤師"
            pinned
          />
          <FindingRow
            severity="warning"
            label="対立"
            description="インスリンレジメン（アナログ基礎・追加）と経済状況が衝突。患者は無保険で小売費用は月$500–700。"
            source="医師・MSW"
          />
          <FindingRow
            severity="warning"
            label="ギャップ"
            description="MFM（母体胎児医学）紹介が未手配。HbA1c 11.4%のハイリスク妊娠では必須。"
            source="統合役"
          />
          <FindingRow
            severity="moderate"
            label="ギャップ"
            description="最近のパートナー離別と経済的不安定化があるにもかかわらず、IPV/家庭内安全スクリーニングの記録なし。"
            source="MSW"
          />
          <FindingRow
            severity="ok"
            label="確認済み"
            description="理学療法評価完了。歩行可能で、退院を妨げる移動面の障壁なし。"
            source="PT"
          />
          <FindingRow
            severity="neutral"
            label="情報"
            description="ACA特別加入期間の該当性が未評価。離別は約3か月前で、SEPの期間内の可能性あり。"
            source="MSW"
          />
        </div>
      </Section>
    </div>
  );
}
