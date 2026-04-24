import fs from "fs";
import path from "path";
import { CaseOutput } from "./types";

// Resolve a project-root subdirectory regardless of whether cwd is the project
// root (Vercel) or the ui/ subdirectory (local `next dev`).
function resolveProjectDir(subfolder: string): string {
  const candidates = [
    path.join(process.cwd(), "data", subfolder), // Vercel: prebuild copies here
    path.join(process.cwd(), subfolder),          // fallback: cwd = project root
    path.join(process.cwd(), "..", subfolder),    // local dev: cwd = ui/
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  // Fall back to first candidate and let the caller surface a clear error
  return candidates[0];
}

const OUTPUTS_DIR = resolveProjectDir("outputs");

export interface CaseMeta {
  id: number;
  filename: string;
  diagnosis: string;
  teaches: string;
}

export const CASE_META: Record<number, CaseMeta> = {
  1: {
    id: 1,
    filename: "case1_output.json",
    diagnosis: "CHF + Pneumonia",
    teaches: "Baseline multi-agent coordination",
  },
  2: {
    id: 2,
    filename: "case2_output.json",
    diagnosis: "Post-stroke, hemiparesis",
    teaches: "Value conflict navigation",
  },
  3: {
    id: 3,
    filename: "case3_output.json",
    diagnosis: "DKA + 7wk pregnancy",
    teaches: "Life-saving catch",
  },
};

export function loadCase(id: number): CaseOutput {
  const meta = CASE_META[id];
  if (!meta) throw new Error(`Case ${id} not found`);
  const filePath = path.join(OUTPUTS_DIR, meta.filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as CaseOutput;
}

export function loadAllCases(): { id: number; meta: CaseMeta; data: CaseOutput }[] {
  return Object.values(CASE_META).map((meta) => ({
    id: meta.id,
    meta,
    data: loadCase(meta.id),
  }));
}
