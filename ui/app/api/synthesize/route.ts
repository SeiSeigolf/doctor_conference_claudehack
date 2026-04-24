import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CASE_FILES: Record<number, string> = {
  1: "case1_chen.json",
  2: "case2_jackson.json",
  3: "case3_williams.json",
};

const CLINICAL_MODEL = "claude-sonnet-4-6";
const ORCHESTRATOR_MODEL = "claude-opus-4-7";

function resolveProjectDir(subfolder: string): string {
  const candidates = [
    path.join(process.cwd(), "data", subfolder), // Vercel: prebuild copies here
    path.join(process.cwd(), subfolder),          // fallback: cwd = project root
    path.join(process.cwd(), "..", subfolder),    // local dev: cwd = ui/
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

function loadPrompt(name: string): string {
  const agentsDir = resolveProjectDir("agents");
  return fs.readFileSync(path.join(agentsDir, `${name}.md`), "utf-8");
}

function extractJSON(text: string, role: string): Record<string, unknown> {
  const clean = text
    .replace(/^```(?:json)?\r?\n?/, "")
    .replace(/\r?\n?```$/, "")
    .trim();
  try {
    return JSON.parse(clean);
  } catch {
    // Second attempt: extract first {...} block
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        throw new Error(`Agent '${role}' returned unparseable JSON`);
      }
    }
    throw new Error(`Agent '${role}' returned unparseable JSON`);
  }
}

async function runAgent(
  role: string,
  caseData: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const system = loadPrompt(role);
  const response = await client.messages.create({
    model: CLINICAL_MODEL,
    max_tokens: 8192,
    system,
    messages: [
      {
        role: "user",
        content:
          "Analyze the following synthetic patient case from your professional perspective. " +
          "Return only valid JSON matching your output schema. No prose before or after the JSON.\n\n" +
          `PATIENT CASE:\n${JSON.stringify(caseData, null, 2)}`,
      },
    ],
  });
  const block = response.content[0];
  const text = block.type === "text" ? block.text : "";
  return extractJSON(text, role);
}

export async function POST(req: NextRequest) {
  const { caseId } = (await req.json()) as { caseId: number };

  const caseFile = CASE_FILES[caseId];
  if (!caseFile) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  // Simulate EHR pull: read synthetic case JSON
  const casePath = path.join(resolveProjectDir("cases"), caseFile);
  const caseData = JSON.parse(fs.readFileSync(casePath, "utf-8")) as Record<
    string,
    unknown
  >;

  // Run all 5 clinical agents in parallel
  const roles = ["physician", "nurse", "pharmacist", "msw", "pt"];
  const agentResults = await Promise.allSettled(
    roles.map((role) => runAgent(role, caseData))
  );

  const agentOutputs: Record<string, Record<string, unknown>> = {};
  for (let i = 0; i < roles.length; i++) {
    const result = agentResults[i];
    agentOutputs[roles[i]] =
      result.status === "fulfilled"
        ? result.value
        : { error: result.reason?.message ?? "Agent failed" };
  }

  // Run orchestrator
  const orchSystem = loadPrompt("orchestrator");
  const orchResponse = await client.messages.create({
    model: ORCHESTRATOR_MODEL,
    max_tokens: 16384,
    system: orchSystem,
    messages: [
      {
        role: "user",
        content:
          "Synthesize the following patient case and five specialist agent outputs " +
          "into a final discharge planning package. " +
          "Return only valid JSON matching your output schema.\n\n" +
          `PATIENT CASE:\n${JSON.stringify(caseData, null, 2)}\n\n` +
          `CLINICAL AGENT OUTPUTS:\n${JSON.stringify(agentOutputs, null, 2)}`,
      },
    ],
  });

  const orchBlock = orchResponse.content[0];
  const orchText = orchBlock.type === "text" ? orchBlock.text : "";
  const synthesis = extractJSON(orchText, "orchestrator");

  // Inject fields the model cannot self-report reliably
  synthesis.synthesis_timestamp = new Date().toISOString();
  if (typeof synthesis.meta === "object" && synthesis.meta !== null) {
    (synthesis.meta as Record<string, unknown>).model = ORCHESTRATOR_MODEL;
    (synthesis.meta as Record<string, unknown>).reasoning_effort = "xhigh";
  }
  synthesis._agent_outputs = agentOutputs;

  return NextResponse.json(synthesis);
}
