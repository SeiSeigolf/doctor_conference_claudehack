"""Orchestrator synthesis for ROUNDS.ai.

Runs all 5 clinical agents in parallel, then calls the Orchestrator (Opus)
to synthesize their outputs into a final discharge planning package.
"""

import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import anthropic

from src.agents.runner import ClinicalAgent, CLINICAL_ROLES, _parse_json_response

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).parent.parent.parent

# Orchestrator runs on Opus per CLAUDE.md. Update model ID when Opus 4.7 is released.
ORCHESTRATOR_MODEL = "claude-opus-4-5"
ORCHESTRATOR_MAX_TOKENS = 8192


def _load_orchestrator_prompt() -> str:
    """Load orchestrator system prompt from agents/orchestrator.md."""
    path = _PROJECT_ROOT / "agents" / "orchestrator.md"
    if not path.exists():
        raise FileNotFoundError(f"Orchestrator prompt not found: {path}")
    return path.read_text(encoding="utf-8")


def _run_agent(role: str, case_data: dict, client: anthropic.Anthropic) -> tuple[str, dict]:
    """Run a single clinical agent; returns (role, output_dict)."""
    agent = ClinicalAgent(role=role, client=client)
    output = agent.run(case_data)
    logger.info("Agent '%s' completed.", role)
    return role, output


def run_clinical_agents(
    case_data: dict,
    client: anthropic.Anthropic,
    verbose: bool = False,
) -> dict[str, dict]:
    """Run all 5 clinical agents in parallel against the patient case.

    Args:
        case_data: Parsed patient case dict.
        client: Shared Anthropic client.
        verbose: If True, log agent outputs to stdout.

    Returns:
        Dict mapping role name to structured agent output dict.
    """
    results: dict[str, dict] = {}
    errors: dict[str, Exception] = {}

    if verbose:
        print(f"\nRunning {len(CLINICAL_ROLES)} clinical agents in parallel...")

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(_run_agent, role, case_data, client): role
            for role in CLINICAL_ROLES
        }
        for future in as_completed(futures):
            role = futures[future]
            try:
                _, output = future.result()
                results[role] = output
                if verbose:
                    print(f"  ✓ {role}")
            except Exception as exc:
                errors[role] = exc
                logger.error("Agent '%s' failed: %s", role, exc)
                if verbose:
                    print(f"  ✗ {role}: {exc}")

    if errors:
        # Include partial results; orchestrator will note missing agents in meta
        logger.warning("Agents failed: %s", list(errors.keys()))

    return results


def _build_orchestrator_message(case_data: dict, agent_outputs: dict[str, dict]) -> str:
    """Compose the user message for the orchestrator with case + all agent outputs."""
    return (
        "Synthesize the following patient case and five specialist agent outputs "
        "into a final discharge planning package. "
        "Return only valid JSON matching your output schema.\n\n"
        f"PATIENT CASE:\n{json.dumps(case_data, indent=2, ensure_ascii=False)}\n\n"
        f"CLINICAL AGENT OUTPUTS:\n{json.dumps(agent_outputs, indent=2, ensure_ascii=False)}"
    )


def synthesize(
    case_data: dict,
    agent_outputs: dict[str, dict],
    client: anthropic.Anthropic,
    verbose: bool = False,
) -> dict:
    """Call the Orchestrator to synthesize 5 agent outputs into final discharge package.

    Args:
        case_data: Parsed patient case dict.
        agent_outputs: Dict mapping role to agent output dict.
        client: Shared Anthropic client.
        verbose: If True, print progress to stdout.

    Returns:
        Orchestrator output as a structured dict.

    Raises:
        ValueError: If orchestrator returns malformed JSON.
    """
    system_prompt = _load_orchestrator_prompt()
    user_message = _build_orchestrator_message(case_data, agent_outputs)

    if verbose:
        print(f"\nCalling Orchestrator ({ORCHESTRATOR_MODEL})...")

    response = client.messages.create(
        model=ORCHESTRATOR_MODEL,
        max_tokens=ORCHESTRATOR_MAX_TOKENS,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    text = response.content[0].text
    result = _parse_json_response(text, "orchestrator")

    if verbose:
        print("  ✓ Orchestrator synthesis complete.")

    return result


def run_full_pipeline(
    case_data: dict,
    verbose: bool = False,
) -> dict:
    """Run the complete ROUNDS.ai pipeline: 5 agents → orchestrator.

    Args:
        case_data: Parsed patient case dict.
        verbose: If True, print progress to stdout.

    Returns:
        Final orchestrator output dict containing the full discharge planning package.
    """
    client = anthropic.Anthropic()

    agent_outputs = run_clinical_agents(case_data, client, verbose=verbose)
    orchestrator_output = synthesize(case_data, agent_outputs, client, verbose=verbose)

    # Attach raw agent outputs to the result for UI consumption
    orchestrator_output["_agent_outputs"] = agent_outputs

    return orchestrator_output
