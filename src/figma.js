const API = "https://api.figma.com/v1";

export async function getFile(fileKey, token) {
  const res = await fetch(`${API}/files/${fileKey}`, {
    headers: { "X-Figma-Token": token },
  });

  if (!res.ok) {
    const text = await res.text();

    throw new Error(`Figma file fetch failed ${res.status}: ${text}`);
  }

  return res.json();
}

export function* walk(node) {
  if (!node) return;
  yield node;
  const kids = node.children || [];
  for (const k of kids) yield* walk(k);
}

export async function findFrame(doc, frameId) {
  if (frameId) {
    for (const n of walk(doc.document)) {
      if (n.id === frameId && /^(FRAME|COMPONENT|INSTANCE)$/.test(n.type))
        return n;
    }

    throw new Error(`Frame with ID: ${frameId} not found!`);
  }

  for (const page of doc.document.children || []) {
    for (const n of page.children || []) {
      if (n.type === "FRAME") return n;
    }
  }

  throw new Error("No new frame found in file!");
}
