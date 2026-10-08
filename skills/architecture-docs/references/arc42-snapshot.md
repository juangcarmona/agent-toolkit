# Publish a shareable arc42 snapshot

The `arc42-snapshot` tool — bundled inside this skill at `snapshot/` — turns any arc42 documentation folder into one self-contained, navigable HTML page: inline styles, inline pre-rendered Mermaid SVGs, inert JSON data, a hash router, and full-text search. No external resources; the file opens from `file://` and can be shared as a single attachment.

## What it does

1. Reads `README.md` and every `NN-*.md` section file in the docs folder.
2. Validates the [document contract](../SKILL.md#document-contract) (frontmatter keys, section numbering, contiguity). Contract violations produce diagnostics and exit code 2 — the tool never emits a page that silently omits part of the documentation.
3. Renders Markdown to HTML via `marked`, rewriting relative `.md` links between sections to hash routes (`#/section/NN`). Links to files outside the docs folder (evidence paths, `../adr/...`) become inert monospaced text — a single file cannot carry them.
4. Pre-renders every ` ```mermaid ` fenced block to inline SVG via mermaid-cli/Puppeteer, normalizing IDs so multiple diagrams never collide.
5. Writes one HTML file with a sidebar, keyboard navigation (`/` to search, `←`/`→` for prev/next, `?` for shortcuts), light/dark appearance toggle, and a Git revision stamp.

## Prerequisites (one-time install)

The tool needs Node.js ≥ 18 and three npm packages. Install them once from the skill's `snapshot/` directory:

```bash
cd <skill-install-dir>/snapshot
npm install
```

This installs `marked`, `js-yaml`, and `@mermaid-js/mermaid-cli` (which pulls in Puppeteer/Chromium for Mermaid rendering).

## How to run it

```bash
# Basic: generate from any arc42 docs folder
node <skill-install-dir>/snapshot/generate.mjs path/to/docs/architecture

# Custom output path
node <skill-install-dir>/snapshot/generate.mjs path/to/docs/architecture --out snapshot.html

# Custom title (overrides the auto-derived name)
node <skill-install-dir>/snapshot/generate.mjs path/to/docs/architecture --title "My Platform"
```

**Default output:** `<docsDir>/../arc42-snapshot.html` — a sibling of the docs folder. Override with `--out`.

**Mermaid rendering** launches Puppeteer/Chromium; expect ~1–2 minutes for a folder with ~20 diagrams.

## When to use it

- **After completing an architecture documentation update** — generate a snapshot so reviewers can navigate the full arc42 picture without cloning the repo.
- **Before a milestone review** — share the single HTML file with stakeholders who need read-only access to the current architecture state.
- **To validate the document contract** — the tool's diagnostics catch missing frontmatter, duplicate section numbers, and numbering gaps before they reach a reviewer.

## What the snapshot is not

The snapshot is a **point-in-time rendering**, not a live document. It carries no server, no forms, and no persistence. Relative links to files outside the docs folder are intentionally inert. The canonical source remains the Markdown files; the HTML is regenerable output.

## Relationship to the architecture-docs skill

The tool reads the exact frontmatter contract this skill defines (`title`, `arc42-section`, `description`). It is the publishing companion to the skill's authoring workflow: the skill governs what goes *into* the documents; the snapshot tool renders what comes *out*. The tool is bundled at `snapshot/` inside the skill so that installing the skill gives you both the authoring instructions and the publishing tool.
