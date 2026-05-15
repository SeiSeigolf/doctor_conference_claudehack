// Patient record store — localStorage-backed, role-by-role progressive intake

export interface BasicInfo {
  name: string; age: string; sex: string;
  admissionDate: string; losDays: string;
  admissionType: string; unit: string; chiefComplaint: string;
}

export interface PhysicianData {
  primaryDx: string; secondaryDx: string[];
  medications: string; keyLabs: string;
  currentBp: string; currentHr: string; currentSpo2: string;
  comorbidities: string; emergencyAdmission: boolean;
  edVisitsPrior6mo: string; clinicalSummary: string;
  followUpPlan: string; safetyFlags: string;
  savedAt: string;
}

export interface NurseData {
  educationReadiness: string; educationBarriers: string;
  medicationComplexity: string; injectionRequired: boolean;
  injectionEducationDone: boolean; adlStatus: string; adlConcerns: string;
  caregiverIdentified: boolean; caregiverName: string;
  caregiverAvailability: string; woundCareNeeds: string;
  warningSignsEducated: string; concerns: string;
  savedAt: string;
}

export interface PharmacistData {
  reconciliationDone: boolean; highRiskMeds: string;
  drugInteractions: string; medsToStop: string; newMeds: string;
  allergies: string; insuranceCoverage: string;
  patientUnderstanding: string; counselingDone: boolean;
  concerns: string; savedAt: string;
}

export interface MSWData {
  livingSituation: string; insurance: string; supportSystem: string;
  transportationAccess: boolean; transportationNotes: string;
  housingStability: string; foodSecurity: string;
  financialConcerns: string; mentalHealthConcerns: string;
  substanceUse: string; resourcesArranged: string;
  homeHealthNeeded: boolean; followUpArranged: boolean;
  followUpDetails: string; concerns: string;
  savedAt: string;
}

export interface PTData {
  priorFunctionalStatus: string; ambulation: string;
  transferStatus: string; fallRisk: string; balanceImpaired: boolean;
  stairsAtHome: boolean; canManageStairs: boolean;
  equipmentNeeds: string; ptReferral: string;
  rehabNeeded: boolean; concerns: string;
  savedAt: string;
}

export interface PatientRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  basic: BasicInfo;
  physician: PhysicianData | null;
  nurse: NurseData | null;
  pharmacist: PharmacistData | null;
  msw: MSWData | null;
  pt: PTData | null;
}

export type RoleKey = "physician" | "nurse" | "pharmacist" | "msw" | "pt";
export const ROLE_KEYS: RoleKey[] = ["physician", "nurse", "pharmacist", "msw", "pt"];
export const ROLE_LABELS: Record<RoleKey, string> = {
  physician:  "医師",
  nurse:      "看護師",
  pharmacist: "薬剤師",
  msw:        "医療ソーシャルワーカー",
  pt:         "理学療法",
};
export const ROLE_ABBREV: Record<RoleKey, string> = {
  physician: "MD", nurse: "RN", pharmacist: "RPh", msw: "MSW", pt: "PT",
};

function idsKey() { return "rounds_patient_ids"; }
function patientKey(id: string) { return `rounds_patient_${id}`; }
export function synthesisKey(id: string) { return `rounds_synthesis_${id}`; }

export function getAllPatientIds(): string[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(idsKey()) ?? "[]");
}

export function getPatient(id: string): PatientRecord | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(patientKey(id));
  return raw ? (JSON.parse(raw) as PatientRecord) : null;
}

export function savePatient(patient: PatientRecord): void {
  patient.updatedAt = new Date().toISOString();
  localStorage.setItem(patientKey(patient.id), JSON.stringify(patient));
  const ids = getAllPatientIds();
  if (!ids.includes(patient.id)) {
    ids.unshift(patient.id); // newest first
    localStorage.setItem(idsKey(), JSON.stringify(ids));
  }
}

export function deletePatient(id: string): void {
  localStorage.removeItem(patientKey(id));
  localStorage.removeItem(synthesisKey(id));
  const ids = getAllPatientIds().filter((i) => i !== id);
  localStorage.setItem(idsKey(), JSON.stringify(ids));
}

export function getSynthesis(id: string): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(synthesisKey(id));
  return raw ? JSON.parse(raw) : null;
}

export function saveSynthesis(id: string, data: Record<string, unknown>): void {
  localStorage.setItem(synthesisKey(id), JSON.stringify(data));
}

export function completedRoles(patient: PatientRecord): RoleKey[] {
  return ROLE_KEYS.filter((k) => patient[k] !== null);
}

export function buildCaseJson(patient: PatientRecord): Record<string, unknown> {
  const { basic, physician, nurse, pharmacist, msw, pt } = patient;
  return {
    _synthetic_notice: "ROUNDS.ai patient intake — not real patient data.",
    case_id: `INTAKE-${patient.id.slice(0, 8).toUpperCase()}`,
    patient: {
      name: basic.name,
      age: parseInt(basic.age) || 0,
      sex: basic.sex,
      mrn: `MRN-${patient.id.slice(0, 6).toUpperCase()}`,
    },
    admission: {
      date: basic.admissionDate,
      primary_dx: physician?.primaryDx ?? "(not entered)",
      secondary_dx: physician?.secondaryDx.filter(Boolean) ?? [],
      los_days: parseInt(basic.losDays) || 1,
      admission_type: physician?.emergencyAdmission ? "Emergency" : basic.admissionType,
      admitting_unit: basic.unit,
      chief_complaint: basic.chiefComplaint,
    },
    medications_freetext: physician?.medications ?? "",
    key_labs: physician?.keyLabs ?? "",
    current_vitals: {
      bp: physician?.currentBp ?? "",
      hr: physician?.currentHr ?? "",
      spo2_pct: physician?.currentSpo2 ?? "",
    },
    comorbidities: physician?.comorbidities ?? "",
    clinical_summary: physician?.clinicalSummary ?? "",
    follow_up_plan: physician?.followUpPlan ?? "",
    safety_flags_noted: physician?.safetyFlags ?? "",
    lace_inputs: {
      L_los_days: parseInt(basic.losDays) || 1,
      A_emergency_admission: physician?.emergencyAdmission ?? false,
      E_ed_visits_prior_6_months: physician?.edVisitsPrior6mo ?? "0",
      C_comorbidities_note: physician?.comorbidities ?? "",
    },
    functional_status: {
      adl_status: nurse?.adlStatus ?? "",
      adl_concerns: nurse?.adlConcerns ?? "",
      ambulation: pt?.ambulation ?? "",
      transfer_status: pt?.transferStatus ?? "",
      fall_risk: pt?.fallRisk ?? "",
      balance_impaired: pt?.balanceImpaired ?? false,
    },
    nursing_assessment: nurse ? {
      education_readiness: nurse.educationReadiness,
      education_barriers: nurse.educationBarriers,
      medication_complexity: nurse.medicationComplexity,
      injection_required: nurse.injectionRequired,
      injection_education_done: nurse.injectionEducationDone,
      caregiver_identified: nurse.caregiverIdentified,
      caregiver_name: nurse.caregiverName,
      caregiver_availability: nurse.caregiverAvailability,
      wound_care_needs: nurse.woundCareNeeds,
      warning_signs_educated: nurse.warningSignsEducated,
      concerns: nurse.concerns,
    } : { note: "Nurse assessment not yet entered" },
    pharmacy_assessment: pharmacist ? {
      reconciliation_complete: pharmacist.reconciliationDone,
      high_risk_medications: pharmacist.highRiskMeds,
      drug_interactions: pharmacist.drugInteractions,
      medications_to_discontinue: pharmacist.medsToStop,
      new_medications_at_discharge: pharmacist.newMeds,
      drug_allergies: pharmacist.allergies,
      insurance_coverage: pharmacist.insuranceCoverage,
      patient_understanding: pharmacist.patientUnderstanding,
      counseling_complete: pharmacist.counselingDone,
      concerns: pharmacist.concerns,
    } : { note: "Pharmacy assessment not yet entered" },
    social_work_assessment: msw ? {
      living_situation: msw.livingSituation,
      insurance_status: msw.insurance,
      support_system: msw.supportSystem,
      transportation_access: msw.transportationAccess,
      transportation_notes: msw.transportationNotes,
      housing_stability: msw.housingStability,
      food_security: msw.foodSecurity,
      financial_concerns: msw.financialConcerns,
      mental_health_concerns: msw.mentalHealthConcerns,
      substance_use: msw.substanceUse,
      community_resources_arranged: msw.resourcesArranged,
      home_health_needed: msw.homeHealthNeeded,
      follow_up_arranged: msw.followUpArranged,
      follow_up_details: msw.followUpDetails,
      concerns: msw.concerns,
    } : { note: "Social work assessment not yet entered" },
    pt_assessment: pt ? {
      prior_functional_status: pt.priorFunctionalStatus,
      stairs_at_home: pt.stairsAtHome,
      can_manage_stairs: pt.canManageStairs,
      equipment_needs: pt.equipmentNeeds,
      pt_referral: pt.ptReferral,
      rehab_facility_needed: pt.rehabNeeded,
      concerns: pt.concerns,
    } : { note: "PT assessment not yet entered" },
  };
}
