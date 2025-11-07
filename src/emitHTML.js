// src/emitHtml.js
export function emitHTML(frame, placed) {
  const parts = [];
  parts.push(`<div class="frame-viewport">`); //generic
  parts.push(
    `<div class="frame-root" data-node-id="${escapeAttr(frame?.id ?? "")}">`
  );

  for (const p of placed) {
    const dataId = `data-node-id="${escapeAttr(p.id)}"`;
    if (p.type === "TEXT") {
      const txt = escapeHtml(p.characters ?? ""); // <-- use characters
      parts.push(`<div class="${p.className}" ${dataId}>${txt}</div>`);
    } else if (p.isVector && p.src) {
      // exportVectors() returns a filename; keep it relative to ./assets/
      const src =
        p.src.startsWith("./") || p.src.startsWith("assets/")
          ? p.src
          : `./assets/${p.src}`;
      parts.push(
        `<img class="${p.className}" ${dataId} src="${escapeAttr(src)}" alt="">`
      );
    } else {
      parts.push(`<div class="${p.className}" ${dataId}></div>`);
    }
  }

  parts.push(`</div>`);
  parts.push(`</div>`);
  return parts.join("\n");
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}
