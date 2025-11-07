import fs from "node:fs/promises";
import path from "node:path";
import { emitCSS } from "./emitCss";
import { emitHTML } from "./emitHTML";

//color helpers
function rgba({ r = 0, g = 0, b = 0, a = 1 }) {
  const R = Math.round(r * 255);
  const G = Math.round(r * 255);
  const B = Math.round(r * 255);
  return `rgba(${R}, ${G},  ${B},  ${a})`;
}

//gradient from handles and frame bg

function gradientAngleFromHandles(p) {
  const h = p.gradientHandlePositions;
  if (!h || h.length < 2) return null;
  const dx = h[1].x - h[0].x;
  const dy = h[1].y - h[0].y;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // rotate to CSS coordinates
  return ((Math.round(deg) % 360) + 360) % 360;
}

function gradientAngleFromTransform(p) {
  const m = p.gradientTransform;
  if (!Array.isArray(m) || !m[0] || !m[1]) return null;
  const x = m[0][0] ?? 1,
    y = m[1][0] ?? 0;
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return ((Math.round(deg) % 360) + 360) % 360;
}

function gradientToCss(p) {
  let deg = gradientAngleFromHandles(p);
  if (deg == null) deg = gradientAngleFromTransform(p) ?? 0;
  const stops = (p.gradientStops || []).map((s) => {
    const c = s.color || {};
    const col = `rgba(${Math.round((c.r ?? 0) * 255)}, ${Math.round(
      (c.g ?? 0) * 255
    )}, ${Math.round((c.b ?? 0) * 255)}, ${c.a ?? 1})`;
    const pos = Math.round((s.position ?? 0) * 100);
    return `${col} ${pos}%`;
  });
  return `linear-gradient(${deg}deg, ${stops.join(", ")})`;
}

function resolveFill(paints, fallbackBackgroundColor) {
  if (paints && paints.length) {
    const vis = paints.find((p) => p?.visible !== false);
    if (vis) {
      if (vis.type === "SOLID") {
        const a =
          typeof vis.opacity === "number" ? vis.opacity : vis.color?.a ?? 1;
        return rgba({ ...(vis.color || {}), a });
      }
      if (vis.type === "GRADIENT_LINEAR") return gradientToCss(vis);
    }
  }
  if (fallbackBackgroundColor) return rgba(fallbackBackgroundColor);
  return null;
}

//Bounds helpers

function collectBoxes(node, out = []) {
  if (node?.absoluteBoundingBox) {
    out.push(node.absoluteBoundingBox);
  }
  const kids = node?.children || [];
  for (const k of kids) {
    collectBoxes(k, out);
  }

  return out;
}

function computeFrameBounds(frame) {
  if (frame.absoluteBoundingBox) {
    return frame.absoluteBoundingBox;
  }

  const boxes = collectBoxes(frame, []);

  if (boxes.length) {
    const minX = Math.min(...boxes.map((b) => b.x));
    const minY = Math.min(...boxes.map((b) => b.y));
    const maxX = Math.max(...boxes.map((b) => b.x + b.width));
    const maxY = Math.max(...boxes.map((b) => b.y + b.height));
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  throw new Error("Cannot compute bounds");
}

const firstVisibleSolid = (paints) =>
  (paints || []).find((p) => p?.visible !== false && p.type === "SOLID") ||
  null;

function resolveStroke(node) {
  const s = firstVisibleSolid(node.strokes);
  if (!s) return null;
  const a = typeof s.opacity === "number" ? s.opacity : s.color?.a ?? 1;
  const color = rgba({ ...(s.color || {}), a });

  let w = node.strokeWeight;
  if (typeof w !== "number") {
    const sides = [
      node.strokeTopWeight,
      node.strokeRightWeight,
      node.strokeBottomWeight,
      node.strokeLeftWeight,
    ].filter((x) => typeof x === "number");
    w = sides.length ? Math.max(...sides) : 0;
  }
  if (!w) return null;
  return { align: node.strokeAlign || "CENTER", width: w, color };
}

function effectsToBoxShadow(effects) {
  if (!effects) return null;
  const out = [];
  for (const e of effects) {
    if (e?.visible === false) continue;
    if (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") {
      const col = rgba(e.color || {});
      const inset = e.type === "INNER_SHADOW" ? " inset" : "";
      out.push(
        `${Math.round(e.offset?.x || 0)}px ${Math.round(
          e.offset?.y || 0
        )}px ${Math.round(e.radius || 0)}px ${Math.round(
          e.spread || 0
        )}px ${col}${inset}`
      );
    }
  }
  return out.length ? out.join(",") : null;
}

function extractBackgroundBlur(effects) {
  if (!effects) return null;
  const b = effects.find(
    (e) => e?.visible !== false && e.type === "BACKGROUND_BLUR"
  );
  if (!b) return null;
  return { hasBackgroundBlur: true, blurRadius: Math.round(b.radius || 0) };
}


export async function build({frame, outDir}){
  const frameBox = computeFrameBounds(frame);

  const placed = [];
  const css = emitCSS(frameBox, placed, {
    bg: "transparent",
    radius: null,
    clip: false,
  });
  const htmlInner = emitHTML(frame, placed);

  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>fig2html output</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./styles.css">
</head>
<body>
${htmlInner}
</body>
</html>`;

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "styles.css"), css, "utf-8");
  await fs.writeFile(path.join(outDir, "index.html"), doc, "utf-8");

  return { trace: null };
}

//helper for utilities
function classNameFromId(id) {
  return `n_${String(id).replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}