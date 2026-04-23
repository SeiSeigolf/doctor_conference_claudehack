"""LACE index scoring for 30-day hospital readmission risk.

Based on van Walraven C et al., CMAJ 2010;182(6):551-7.
All inputs are derived from synthetic patient case JSON data.
"""

from typing import Literal


RiskTier = Literal["LOW", "MODERATE", "HIGH", "VERY_HIGH"]


def _score_l(los_days: int) -> int:
    """Length-of-stay component: 1–7 points."""
    if los_days <= 0:
        return 0
    if los_days == 1:
        return 1
    if los_days == 2:
        return 2
    if los_days == 3:
        return 3
    if los_days <= 6:
        return 4
    if los_days <= 13:
        return 5
    return 7


def _score_a(emergency_admission: bool) -> int:
    """Acuity component: 0 or 3."""
    return 3 if emergency_admission else 0


def _score_c(charlson_index: int) -> int:
    """Charlson Comorbidity Index component: 0–5."""
    if charlson_index <= 0:
        return 0
    if charlson_index == 1:
        return 1
    if charlson_index == 2:
        return 2
    if charlson_index == 3:
        return 3
    return 5  # ≥4 maps to 5 in LACE


def _score_e(ed_visits_6mo: int) -> int:
    """ED visits in prior 6 months component: 0–4."""
    if ed_visits_6mo <= 0:
        return 0
    if ed_visits_6mo == 1:
        return 1
    if ed_visits_6mo == 2:
        return 2
    if ed_visits_6mo == 3:
        return 3
    return 4  # ≥4 capped at 4


def _risk_tier(total: int) -> RiskTier:
    """Map total LACE score to readmission risk tier."""
    if total <= 4:
        return "LOW"
    if total <= 9:
        return "MODERATE"
    if total <= 12:
        return "HIGH"
    return "VERY_HIGH"


def calculate_lace(case_data: dict) -> dict:
    """Calculate LACE index from patient case data.

    Args:
        case_data: Parsed patient case JSON dict containing a 'lace_inputs' key.

    Returns:
        Dict with L, A, C, E component scores, total, tier, and component details.

    Raises:
        KeyError: If required lace_inputs fields are missing from case_data.
    """
    inputs = case_data["lace_inputs"]

    l_score = _score_l(inputs["L_los_days"])
    a_score = _score_a(inputs["A_emergency_admission"])
    c_score = _score_c(inputs["C_charlson_score"])
    e_score = _score_e(inputs["E_ed_visits_prior_6_months"])

    total = l_score + a_score + c_score + e_score
    tier = _risk_tier(total)

    tier_descriptions: dict[RiskTier, str] = {
        "LOW": "Standard discharge. Follow-up within 1 week.",
        "MODERATE": "Confirm follow-up within 7 days. Notify PCP at discharge.",
        "HIGH": "Follow-up within 48–72 hours. Consider home health.",
        "VERY_HIGH": "Do not discharge without bridge supports confirmed. "
                     "Home health, pharmacy, and social work coordination required same-day.",
    }

    return {
        "patient_id": case_data.get("case_id", "UNKNOWN"),
        "patient_name": case_data.get("patient", {}).get("name", "UNKNOWN"),
        "components": {
            "L": {
                "label": "Length of Stay",
                "los_days": inputs["L_los_days"],
                "score": l_score,
            },
            "A": {
                "label": "Acuity of Admission",
                "emergency": inputs["A_emergency_admission"],
                "score": a_score,
            },
            "C": {
                "label": "Charlson Comorbidity Index",
                "charlson_raw": inputs["C_charlson_score"],
                "score": c_score,
            },
            "E": {
                "label": "ED Visits Prior 6 Months",
                "ed_visits": inputs["E_ed_visits_prior_6_months"],
                "score": e_score,
            },
        },
        "total": total,
        "tier": tier,
        "tier_description": tier_descriptions[tier],
        "case_json_total": inputs.get("total_lace_score"),
        "scores_match": total == inputs.get("total_lace_score"),
    }
