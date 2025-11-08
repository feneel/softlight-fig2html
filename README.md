# softlight-fig2html

A small Node.js CLI that converts a Figma frame into static **HTML + CSS**.

Given a Figma file (or URL) and a target frame, it:

- Calls the Figma REST API
- Walks the document tree and flattens layers
- Generates absolutely-positioned HTML elements
- Emits CSS that reproduces layout, typography, fills, gradients, borders, and shadows

The goal is to be **visually close** to the Figma mock and to **generalize** beyond the provided take-home file.

---

## Tech stack

- **Node.js** (ES Modules) – tested with Node 20
- **Figma REST API** (v1)
- Plain **HTML + CSS**, no runtime framework

---

## Setup

1. **Clone the repo**

```bash
git clone https://github.com/feneel/softlight-fig2html.git
cd softlight-fig2html
````

2. **Install dependencies**

```bash
npm install
```

3. **Set Figma API token**

Create a personal access token in Figma:

* Figma → **Settings** → **Personal access tokens**
* Generate a token, copy it

Then either:

```bash
export FIGMA_TOKEN=`token`
```

or create a `.env` and load it in your own way (optional).

4. **Get your file key**

* Open the Figma file in the browser
* Copy the `<FILE_KEY>` part.

---

## Usage

Basic usage:

```bash
FIGMA_TOKEN=your-token node bin/fig2html.js <FILE_KEY|FIGMA_URL>
```

---

## Output

The CLI writes to a `dist/` directory:

* `dist/index.html` – generated markup
* `dist/styles.css` – generated CSS

Open:

```bash
open dist/index.html
```

(or double-click in Finder / Explorer).

---

## Project structure

```txt
bin/
  fig2html.js        # CLI entry point

src/
  figma.js           # Figma API helpers (getFile, findFrame)
  build.js           # Core pipeline: Figma frame -> placed layers -> HTML/CSS/SVG
  emitCss.js         # Converts normalized layers into CSS rules
  emitHtml.js        # Converts normalized layers into HTML elements
  vectors.js         # Export vector nodes to SVG via Figma Images API
```

---