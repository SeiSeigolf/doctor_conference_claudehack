/**
 * Prebuild script: copies project data files into ui/data/ so they are
 * bundled with Vercel serverless functions at build time.
 *
 * Source (project root):  cases/, agents/, outputs/
 * Destination (ui/data/): data/cases/, data/agents/, data/outputs/
 */

const fs = require("fs");
const path = require("path");

const UI_DIR = __dirname.replace(/[/\\]scripts$/, "");
const PROJECT_ROOT = path.join(UI_DIR, "..");

const COPIES = [
  { src: "cases", dst: path.join(UI_DIR, "data", "cases") },
  { src: "agents", dst: path.join(UI_DIR, "data", "agents") },
  { src: "outputs", dst: path.join(UI_DIR, "data", "outputs") },
];

function copyDir(src, dst) {
  if (!fs.existsSync(src)) {
    console.warn(`  [skip] source not found: ${src}`);
    return;
  }
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const dstPath = path.join(dst, entry);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

console.log("📦 copy-data: copying project files into ui/data/ ...");
for (const { src, dst } of COPIES) {
  const srcPath = path.join(PROJECT_ROOT, src);
  copyDir(srcPath, dst);
  console.log(`  ✓ ${src}/ → data/${src}/`);
}
console.log("📦 copy-data: done.");
