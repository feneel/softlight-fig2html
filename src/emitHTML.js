export function emitHTML(frame, placed) {
  const parts = [];

  parts.push(`<div class="frame-viewport">`); //generic
  parts.push(`<div class="frame-root data-node-id="${frame.id}">`);

  for (const p of placed) {
    //for image
    if (p.src) {
      parts.push(
        `<img class="${p.className}" data-node-id="${p.id}" src="${p.src}" alt="">`
      );
    }
    //for text
    else if (p.type == "TEXT") {
      parts.push(
        `<div class="${p.className}" data-node-id="${p.id}">${escapeHTML(
          p.characters || ""
        )}</div>`
      );
    }
    //for other types
    else {
      parts.push(`<div class= "${p.className}" data-node-id="${p.id}"></div>`);
    }
  }
}

//helper escapeHTML for text nodes
function escapeHTML(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
