export type RiskTier = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
export type ReadinessStatus = "ready" | "conditional" | "not_ready";
export type Priority = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";

export interface LaceScore {
  total: number;
  tier: RiskTier;
  implication: string;
}

export interface Conflict {
  conflict_id: string;
  summary: string;
  positions: { holder: string; position: string }[];
  resolution_options: { option: string; trade_off: string }[];
  requires_physician_decision: boolean;
  urgency: string;
}

export interface Gap {
  gap_id: string;
  summary: string;
  source?: string;
  action_required: string;
  owner: string;
  urgency: string;
}

export interface Action {
  rank: number;
  priority: Priority;
  action: string;
  owner: string;
  urgency: string;
  rationale: string;
}

export interface AgendaItem {
  order: number;
  time_minutes: number;
  presenting_role: string;
  agenda_item: string;
  key_question: string;
}

export interface Meta {
  agents_providing_output: string[];
  agents_missing_output: string[];
  synthesis_confidence: string;
  confidence_notes?: string;
  model: string;
  reasoning_effort?: string;
}

export interface CaseOutput {
  patient_id: string;
  patient_name: string;
  synthesis_timestamp: string;
  discharge_readiness: ReadinessStatus;
  discharge_readiness_rationale: string;
  lace_score: LaceScore;
  conflicts: Conflict[];
  gaps: Gap[];
  prioritized_actions: Action[];
  handoff_packages: {
    pcp_summary: string;
    home_health_orders: Record<string, unknown>;
    pharmacy_counseling: Record<string, unknown>;
    patient_instructions: string;
  };
  conference_agenda: AgendaItem[];
  meta: Meta;
  _agent_outputs: Record<string, Record<string, unknown>>;
}
