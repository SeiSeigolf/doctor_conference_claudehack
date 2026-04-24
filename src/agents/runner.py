"""Clinical agent runner for ROUNDS.ai.

Each ClinicalAgent wraps one specialist role (physician, nurse, pharmacist, msw, pt).
It loads the role's system prompt from /agents/{role}.md, sends the patient case
to Claude Sonnet, and returns structured JSON output.
"""

import json
import logging
from pathlib import Path
from typing import Any

import anthropic

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).parent.parent.parent

# Clinical agents run on Sonnet per CLAUDE.md budget rules.
CLINICAL_MODEL = "claude-sonnet-4-6"
CLINICAL_ROLES = ["physician", "nurse", "pharmacist", "msw", "pt"]
MAX_TOKENS = 8192


def _load_system_prompt(role: str) -> str:
    """Load the agent's system prompt from agents/{role}.md."""
    prompt_path = _PROJECT_ROOT / "agents" / f"{role}.md"
    if not prompt_path.exists():
        raise FileNotFoundError(f"Agent prompt not found: {prompt_path}")
    return prompt_path.read_text(encoding="utf-8")


def _build_user_message(case_data: dict) -> str:
    """Format the patient case as the user turn for the agent."""
    return (
        "Analyze the following synthetic patient case from your professional perspective. "
        "Return only valid JSON matching your output schema. No prose before or after the JSON.\n\n"
        f"PATIENT CASE:\n{json.dumps(case_data, indent=2, ensure_ascii=False)}"
    )


def _parse_json_response(text: str, role: str) -> dict:
    """Extract JSON from model response, handling markdown code fences."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        # Strip opening fence (```json or ```) and closing fence
        start = 1
        end = len(lines)
        for i in range(len(lines) - 1, 0, -1):
            if lines[i].strip() == "```":
                end = i
                break
        text = "\n".join(lines[start:end]).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Agent '{role}' returned non-JSON output: {exc}") from exc


class ClinicalAgent:
    """Runs one specialist clinical agent against a patient case."""

    def __init__(self, role: str, client: anthropic.Anthropic | None = None) -> None:
        """Initialize agent with a clinical role name.

        Args:
            role: One of 'physician', 'nurse', 'pharmacist', 'msw', 'pt'.
            client: Optional Anthropic client; creates a new one if not provided.
        """
        if role not in CLINICAL_ROLES:
            raise ValueError(f"Unknown role '{role}'. Must be one of {CLINICAL_ROLES}.")
        self.role = role
        self.system_prompt = _load_system_prompt(role)
        self.client = client or anthropic.Anthropic()

    def run(self, case_data: dict) -> dict[str, Any]:
        """Analyze a patient case and return structured JSON output.

        Retries once if the response is malformed JSON.

        Args:
            case_data: Parsed patient case dict.

        Returns:
            Parsed agent output as a dict.

        Raises:
            ValueError: If both attempts return malformed JSON.
        """
        user_message = _build_user_message(case_data)
        attempts = 0
        last_error: Exception | None = None

        while attempts < 2:
            attempts += 1
            try:
                response = self.client.messages.create(
                    model=CLINICAL_MODEL,
                    max_tokens=MAX_TOKENS,
                    system=self.system_prompt,
                    messages=[{"role": "user", "content": user_message}],
                )
                text = response.content[0].text
                return _parse_json_response(text, self.role)
            except ValueError as exc:
                last_error = exc
                logger.warning(
                    "Agent '%s' attempt %d failed JSON parse: %s",
                    self.role,
                    attempts,
                    exc,
                )
                if attempts < 2:
                    # Retry with explicit reminder to return only JSON
                    user_message = (
                        "Your previous response was not valid JSON. "
                        "Return ONLY the JSON object — no explanation, no markdown fences.\n\n"
                        + user_message
                    )

        raise ValueError(
            f"Agent '{self.role}' failed to return valid JSON after 2 attempts. "
            f"Last error: {last_error}"
        )
