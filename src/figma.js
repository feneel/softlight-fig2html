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
  if (!doc?.document) throw new Error("Invalid Figma file JSON (missing document)");
  const root = doc.document;

  if (frameId) {
    for (const node of walk(root)) {
      if (node.id === frameId) return node;
    }
    throw new Error(`Node with ID ${frameId} not found`);
  }

  // Prefer a FRAME
  for (const node of walk(root)) {
    if (node.type === "FRAME") return node;
  }
  //Accept common containers
  for (const node of walk(root)) {
    if (/^(COMPONENT|INSTANCE|SECTION|GROUP)$/.test(node.type)) return node;
  }
  //Anything that has an absoluteBoundingBox
  for (const node of walk(root)) {
    if (node.absoluteBoundingBox) return node;
  }

  throw new Error("No suitable render root (FRAME/COMPONENT/INSTANCE/SECTION/GROUP) found");
}
