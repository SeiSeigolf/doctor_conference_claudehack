"""ROUNDS.ai CLI entry point.

Usage:
    python src/main.py --case 1
    python src/main.py --case 3 --verbose
    python src/main.py --lace-only 2
"""

import argparse
import json
import logging
import sys
from pathlib import Path

# Ensure project root is on sys.path when run as `python src/main.py`
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()

_PROJECT_ROOT = Path(__file__).parent.parent
_CASES_DIR = _PROJECT_ROOT / "cases"
_OUTPUTS_DIR = _PROJECT_ROOT / "demo_outputs"

_CASE_FILES = {
    1: "case1_chen.json",
    2: "case2_jackson.json",
    3: "case3_williams.json",
}


def _load_case(case_number: int) -> dict:
    """Load and parse a patient case JSON file."""
    if case_number not in _CASE_FILES:
        raise ValueError(
            f"Case {case_number} not found. Available: {list(_CASE_FILES.keys())}"
        )
    path = _CASES_DIR / _CASE_FILES[case_number]
    if not path.exists():
        raise FileNotFoundError(f"Case file not found: {path}")
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def _save_output(case_number: int, output: dict) -> Path:
    """Save pipeline output to demo_outputs/caseN_output.json."""
    _OUTPUTS_DIR.mkdir(exist_ok=True)
    out_path = _OUTPUTS_DIR / f"case{case_number}_output.json"
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    return out_path


def cmd_lace(case_number: int, verbose: bool) -> None:
    """Run LACE scoring only for a case."""
    # Import here to avoid loading anthropic before dotenv for lace-only runs
    from src.scoring.lace import calculate_lace

    case_data = _load_case(case_number)
    result = calculate_lace(case_data)

    print(f"\n{'='*50}")
    print(f"LACE Score — {result['patient_name']} ({result['patient_id']})")
    print(f"{'='*50}")
    for key, comp in result["components"].items():
        print(f"  {key} ({comp['label']}): {comp['score']}")
    print(f"  {'─'*30}")
    print(f"  TOTAL: {result['total']}  [{result['tier']}]")
    print(f"\n  {result['tier_description']}")
    if not result["scores_match"]:
        print(
            f"\n  ⚠ Score mismatch: calculated {result['total']} "
            f"vs case JSON {result['case_json_total']}"
        )
    print()


def cmd_run(case_number: int, verbose: bool) -> None:
    """Run the full ROUNDS.ai pipeline for a case."""
    from src.scoring.lace import calculate_lace
    from src.orchestrator.synthesizer import run_full_pipeline

    case_data = _load_case(case_number)

    # Print LACE upfront so the operator sees risk tier before waiting
    lace = calculate_lace(case_data)
    print(f"\nCase {case_number}: {lace['patient_name']}")
    print(f"LACE: {lace['total']} [{lace['tier']}] — {lace['tier_description']}")

    output = run_full_pipeline(case_data, verbose=verbose)
    out_path = _save_output(case_number, output)

    print(f"\nOutput saved to: {out_path}")

    # Print key synthesis results
    print(f"\n{'='*50}")
    print("SYNTHESIS SUMMARY")
    print(f"{'='*50}")
    print(f"Discharge readiness: {output.get('discharge_readiness', 'UNKNOWN').upper()}")
    print(f"Rationale: {output.get('discharge_readiness_rationale', '')}")

    conflicts = output.get("conflicts", [])
    gaps = output.get("gaps", [])
    actions = output.get("prioritized_actions", [])

    print(f"\nConflicts identified: {len(conflicts)}")
    for c in conflicts:
        print(f"  [{c.get('urgency', '?')}] {c.get('summary', '')}")

    print(f"\nGaps identified: {len(gaps)}")
    for g in gaps:
        print(f"  [{g.get('urgency', '?')}] {g.get('summary', '')}")

    critical = [a for a in actions if a.get("priority") == "CRITICAL"]
    print(f"\nCritical actions ({len(critical)}):")
    for a in critical:
        print(f"  → [{a.get('owner', '?')}] {a.get('action', '')}")

    if verbose:
        print(f"\nFull output: {json.dumps(output, indent=2, ensure_ascii=False)}")


def main() -> None:
    """Parse CLI arguments and dispatch to the appropriate command."""
    parser = argparse.ArgumentParser(
        description="ROUNDS.ai — Multi-agent discharge planning system"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--case",
        type=int,
        metavar="N",
        help="Run the full pipeline for case N (1, 2, or 3)",
    )
    group.add_argument(
        "--lace-only",
        type=int,
        metavar="N",
        dest="lace_only",
        help="Calculate LACE score only for case N",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print full agent and orchestrator outputs",
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )

    try:
        if args.lace_only:
            cmd_lace(args.lace_only, args.verbose)
        else:
            cmd_run(args.case, args.verbose)
    except (FileNotFoundError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
