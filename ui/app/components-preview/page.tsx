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
        Component Vocabulary
      </h1>
      <p className="text-xs text-text-tertiary mb-8 font-mono">
        ROUNDS.ai · Design system preview · All states
      </p>

      {/* ── StatusPill ── */}
      <Section title="StatusPill — all severities (no dot)">
        <div className="flex flex-wrap gap-2">
          {SEVERITIES.map((s) => (
            <StatusPill key={s} severity={s} label={s.toUpperCase()} />
          ))}
        </div>
      </Section>

      <Section title="StatusPill — with dot">
        <div className="flex flex-wrap gap-2">
          {SEVERITIES.map((s) => (
            <StatusPill key={s} severity={s} label={s.toUpperCase()} dot />
          ))}
        </div>
      </Section>

      <Section title="StatusPill — medical labels">
        <div className="flex flex-wrap gap-2">
          <StatusPill severity="critical" label="STAT" dot />
          <StatusPill severity="critical" label="TERATOGENIC" dot />
          <StatusPill severity="critical" label="NOT READY" />
          <StatusPill severity="warning"  label="HIGH RISK" dot />
          <StatusPill severity="warning"  label="CONFLICT" />
          <StatusPill severity="moderate" label="MODERATE" dot />
          <StatusPill severity="ok"       label="CLEARED" dot />
          <StatusPill severity="ok"       label="READY" />
          <StatusPill severity="info"     label="ANALYZING" dot />
          <StatusPill severity="accent"   label="ORCHESTRATOR" dot />
          <StatusPill severity="neutral"  label="QUEUED" />
          <StatusPill severity="neutral"  label="GAP" />
        </div>
      </Section>

      {/* ── MetricDisplay ── */}
      <Section title="MetricDisplay — sizes and severities">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricDisplay value="13"    label="LACE Score"          sublabel="VERY HIGH"       severity="critical" size="lg" />
          <MetricDisplay value="38%"   label="30-Day Readmission"  sublabel="LACE · Calibrated" severity="critical" size="md" />
          <MetricDisplay value="10"    label="LACE Score"          sublabel="MOD-HIGH"        severity="warning"  size="lg" />
          <MetricDisplay value="22%"   label="30-Day Readmission"  sublabel="LACE · Calibrated" severity="warning"  size="md" />
          <MetricDisplay value="12"    label="LACE Score"          sublabel="HIGH"            severity="warning"  size="lg" />
          <MetricDisplay value="5"     label="LACE Score"          sublabel="LOW"             severity="ok"       size="lg" />
          <MetricDisplay value="NOT READY" label="Discharge"       severity="critical" size="sm" />
          <MetricDisplay value="READY"     label="Discharge"       severity="ok"       size="sm" />
        </div>
      </Section>

      {/* ── AgentCard ── */}
      <Section title="AgentCard — all statuses">
        <div className="grid grid-cols-2 gap-3">
          {AGENT_STATUSES.map((status) => (
            <AgentCard
              key={status}
              role="physician"
              label="PHYSICIAN"
              status={status}
              highlights={
                status === "COMPLETE"
                  ? [
                      "Lisinopril teratogenic — discontinue immediately",
                      "Insulin regimen adjustment required for pregnancy",
                      "MFM referral not placed",
                    ]
                  : []
              }
            />
          ))}
        </div>
      </Section>

      <Section title="AgentCard — all 5 roles (COMPLETE)">
        <div className="grid grid-cols-1 gap-2">
          {[
            { role: "physician",  label: "PHYSICIAN",        highlights: ["Lisinopril 10mg — teratogenic, active order not stopped", "Atorvastatin 20mg — teratogenic, not discontinued"] },
            { role: "nurse",      label: "NURSE",            highlights: ["Patient unaware of pregnancy implications on current meds", "Glucagon kit not in room, caregiver not trained"] },
            { role: "pharmacist", label: "PHARMACIST",       highlights: ["TWO teratogenic agents on active orders: lisinopril + atorvastatin", "Insulin affordability: $500-700/mo retail, patient uninsured"] },
            { role: "msw",        label: "SOCIAL WORKER",    highlights: ["Uninsured, Medicaid pending — expedite", "Living alone, no caregiver identified"] },
            { role: "pt",         label: "PHYSICAL THERAPY", highlights: ["Functional for discharge, no PT barrier identified"] },
          ].map((a) => (
            <AgentCard key={a.role} role={a.role} label={a.label} status="COMPLETE" highlights={a.highlights} />
          ))}
        </div>
      </Section>

      <Section title="AgentCard — Orchestrator states">
        <div className="grid grid-cols-2 gap-3">
          <AgentCard role="orchestrator" label="ORCHESTRATOR · OPUS 4.7" status="ANALYZING" isOrchestrator />
          <AgentCard
            role="orchestrator"
            label="ORCHESTRATOR · OPUS 4.7"
            status="COMPLETE"
            isOrchestrator
            highlights={["2 teratogenic medications on active orders", "LACE 13 · 38% 30-day readmission risk", "NOT READY — 6 critical actions required"]}
          />
        </div>
      </Section>

      {/* ── FindingRow ── */}
      <Section title="FindingRow — findings feed">
        <div className="bg-card border border-border-subtle rounded-sm overflow-hidden">
          <FindingRow
            severity="critical"
            label="STAT"
            description="Lisinopril 10mg ACTIVE — Category D teratogen. Confirmed pregnancy at 7 weeks. Discontinue immediately, switch to methyldopa or labetalol."
            source="PHARMACIST · PHYSICIAN"
            pinned
          />
          <FindingRow
            severity="critical"
            label="STAT"
            description="Atorvastatin 20mg ACTIVE — Category X teratogen. Must be discontinued before discharge. Defer lipid management to postpartum."
            source="PHARMACIST"
            pinned
          />
          <FindingRow
            severity="warning"
            label="CONFLICT"
            description="Insulin regimen (analog basal-bolus) vs financial reality: patient uninsured, retail cost $500–700/month."
            source="PHYSICIAN · MSW"
          />
          <FindingRow
            severity="warning"
            label="GAP"
            description="No MFM (Maternal-Fetal Medicine) referral placed. Required for high-risk pregnancy with HbA1c 11.4%."
            source="ORCHESTRATOR"
          />
          <FindingRow
            severity="moderate"
            label="GAP"
            description="No IPV/domestic safety screening documented despite recent partner separation concurrent with financial destabilization."
            source="MSW"
          />
          <FindingRow
            severity="ok"
            label="CLEARED"
            description="Physical therapy assessment complete. Patient ambulatory, no mobility barrier to discharge."
            source="PT"
          />
          <FindingRow
            severity="neutral"
            label="INFO"
            description="ACA Special Enrollment Period eligibility not assessed — separation occurred ~3 months ago, SEP window may still be open."
            source="MSW"
          />
        </div>
      </Section>
    </div>
  );
}
