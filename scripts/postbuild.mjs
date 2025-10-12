import { promises as fs } from "node:fs";
import path from "node:path";

async function main() {
  if (process.env.VERCEL !== "1") return;

  const source = path.join(".next", "routes-manifest.json");
  const destDir = path.join(".vercel", "output");
  const dest = path.join(destDir, "routes-manifest.json");

  try {
    await fs.access(source);
  } catch {
    console.warn(
      "[postbuild] routes-manifest.json not found in .next; skipping copy."
    );
    return;
  }

  await fs.mkdir(destDir, { recursive: true });
  await fs.copyFile(source, dest);
  console.log("[postbuild] Copied routes-manifest.json to .vercel/output");
}

main().catch((err) => {
  console.warn("[postbuild] Failed to copy routes-manifest.json:", err);
});

