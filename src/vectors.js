import fs from "node:fs/promises";
import path from "node:path";

const API = "https://api.figma.com/v1";


export async function exportVectors({ fileKey, token, nodes, outDir }) {
  const vecTypes = new Set(["VECTOR", "BOOLEAN_OPERATION", "STAR", "POLYGON"]);
  const vecs = nodes.filter(n => vecTypes.has(n.type));
  if (vecs.length === 0) return {};

  const ids = vecs.map(n => n.id).join(",");
  const url = `${API}/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=svg&svg_simplify_stroke=true`;

  const res = await fetch(url, { headers: { "X-Figma-Token": token } });
  if (!res.ok) throw new Error(`Figma images export failed ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const map = json.images || {};

  const assetsDir = path.join(outDir, "assets");
  await fs.mkdir(assetsDir, { recursive: true });

  const outMap = {};
  for (const n of vecs) {
    const u = map[n.id];
    if (!u) continue;
    const svgRes = await fetch(u);
    if (!svgRes.ok) continue;
    const svg = await svgRes.text();
    const fname = `v_${n.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.svg`;
    await fs.writeFile(path.join(assetsDir, fname), svg, "utf8");
    outMap[n.id] = `./assets/${fname}`;
  }
  return outMap;
}

