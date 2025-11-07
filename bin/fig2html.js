#!/usr/bin/env node
import { getFile, findFrame } from "../src/figma.js";
import { build } from "../src/build.js";
import path from "node:path";
import fs from "node:fs/promises";

function parseFileArg(arg) {
  if (!arg) return {};
  try {
    const u = new URL(arg);
    const parts = u.pathname.split("/").filter(Boolean);
    const ix = parts.findIndex((p) => p === "file" || p === "design");
    const key = ix >= 0 ? parts[ix + 1] : null;
    let frameId = u.searchParams.get("node-id") || null;
    // Normalize Figma's "0-1" to "0:1"
    if (frameId && !frameId.includes(":") && frameId.includes("-")) {
      frameId = frameId.replace("-", ":");
    }
    return { fileKey: key, frameIdFromUrl: frameId };
  } catch {
    // Not a URL → treat as raw file key
    return { fileKey: arg, frameIdFromUrl: null };
  }
}

function parseFlags(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  return {
    trace: flags.has("--trace"),
    dump: flags.has("--dump-json"),
  };
}

const argv = process.argv.slice(2);
const mainArg = argv.find((a) => !a.startsWith("--"));
const flags = parseFlags(argv);

if (!mainArg) {
  console.error(
    "Usage: FIGMA_TOKEN=... node bin/fig2html.js <FILE_KEY|FIGMA_URL> [FRAME_ID] [--trace] [--dump-json]"
  );
  process.exit(1);
}
if (!process.env.FIGMA_TOKEN) {
  console.error("Missing FIGMA_TOKEN env");
  process.exit(1);
}

const { fileKey, frameIdFromUrl } = parseFileArg(mainArg);
const fileKeyFinal = fileKey || mainArg;
// Allow explicit FRAME_ID as a separate arg like "0:1"
const explicitFrameId = argv.find((a) => /^[0-9]+:[0-9]+$/.test(a));
const frameIdFinal = explicitFrameId || frameIdFromUrl;

try {
  const outDir = path.resolve(process.cwd(), "dist");
  await fs.mkdir(outDir, { recursive: true });

  const doc = await getFile(fileKeyFinal, process.env.FIGMA_TOKEN);
  const frame = findFrame(doc, frameIdFinal);

  console.log("✅ Figma file fetched.");
  console.log(
    `→ Picked node: type=${frame.type} name=${frame.name ?? "(unnamed)"} id=${frame.id}`
  );

  if (flags.dump) {
    await fs.writeFile(
      path.join(outDir, "_raw_file.json"),
      JSON.stringify(doc, null, 2),
      "utf8"
    );
    await fs.writeFile(
      path.join(outDir, "_raw_frame.json"),
      JSON.stringify(frame, null, 2),
      "utf8"
    );
    console.log("💾 Dumped dist/_raw_file.json and dist/_raw_frame.json");
  }

  const result = await build({
    frame,
    outDir,
    fileKey: fileKeyFinal,
    token: process.env.FIGMA_TOKEN,
    trace: flags.trace,
  });

  if (flags.trace && result?.trace) {
    await fs.writeFile(
      path.join(outDir, "_trace.json"),
      JSON.stringify(result.trace, null, 2),
      "utf8"
    );
    console.log("🔎 Wrote dist/_trace.json");
  }

  console.log("✨ Emitted dist/index.html and dist/styles.css");
} catch (e) {
  console.error("❌ Error:", e.message || e);
  process.exit(1);
}
