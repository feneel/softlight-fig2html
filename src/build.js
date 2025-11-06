import fs from "node:fs/promises";
import path from "node:path";
import { emitCSS } from "./emitCss";
import { emitHTML } from "./emitHTML";

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




export async function build({frame, outDir}){

    const frameBox = computeFrameBounds(frame)

    const placed = []
    const css = emitCSS(frameBox, placed, {bg:"transparent", radius: null, clip: false})
    const htmlInner = emitHTML(frame, placed)

    const doc= `<!doctype html>
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
</html>`

    await fs.mkdir(outDir, {recursive: true})
    await fs.writeFile(path.join(outDir, "styles.css"), css, "utf-8")
    await fs.writeFile(path.join(outDir, "index.html"), doc, "utf-8")

    return {trace: null}
}



