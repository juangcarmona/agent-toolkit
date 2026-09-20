---
name: slidev-deck
description: Create or edit Slidev presentations using the deck's configured theme, including local preview, build, export, and source organization.
license: MIT
metadata:
  author: juangcarmona
---

# Slidev deck

Use for decks that use Slidev, whatever theme they configure.

## Workflow

1. Inspect the target deck and its theme: read the deck's `package.json` and `slides.md` frontmatter to find the configured theme, and locate its checkout (a local path dependency, a fork, or the published package) before styling anything.
2. Keep `slides.md` as the entry point and put substantial slide content in `pages/`.
3. Prefer the theme's named layouts over ad-hoc styling. Match its typography, spacing, colors, and visual rhythm.
4. Run `pnpm build` for a deterministic check. Run `pnpm export` when a PDF is requested.
5. Inspect the rendered result before handoff. Fix overflow, weak hierarchy, repeated layouts, and text that became too small.

Do not modify the external theme checkout as part of a deck edit unless the user explicitly asks to improve the theme itself. When a theme change is needed, capture it as a separate, intentional change with a clear upstream relationship.
