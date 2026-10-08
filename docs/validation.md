# Validation

The single CI-equivalent command is:

```shell
npm run validate
```

Install the pinned Python tools into the repository-local `.venv` first with `npm run setup:validation`. JavaScript dependencies are locked by `package-lock.json`; direct Python validation tools are pinned in `requirements-validation.txt`.

Run `npm run setup:snapshot` to install the snapshot runtime from its own lockfile without lifecycle scripts or a Chromium download. CI runs this setup before validation. Snapshot regressions live in `scripts/validate-snapshot.test.mjs`, outside the installable skill; they exercise the renderer, document contract, router and CLI without launching Chromium. Real Mermaid rendering requires the separate browser installation described in the skill's [snapshot reference](../skills/architecture-docs/references/arc42-snapshot.md).

## Layers

| Layer | Command | Responsibility |
| --- | --- | --- |
| Dependency audit | `npm run audit:dependencies` | Known vulnerabilities in the locked JavaScript validation toolchain; the gate fails on critical severity. |
| Markdown | `npm run lint:markdown` | CommonMark style, structural Markdown rules, and one-paragraph-per-line authoring. |
| Agent Skills specification | `npm run validate:skills` | Official `agentskills` reference CLI checks for frontmatter and naming, followed by canonical placement, uniqueness, and no-symlink rules. |
| Links | `npm run validate:links` | Existence of relative Markdown link targets without making network-dependent external link checks part of CI. |
| Snapshot | `npm run validate:snapshot` | Audit the locked snapshot runtime and run repository-only regressions for HTML safety, document completeness, Markdown/SVG rendering, navigation, and CLI behavior. |
| skills CLI | `npm run validate:discovery` | Discovery of every canonical skill, selected-skill installation with provenance lock generation, and complete-collection installation through the pinned Vercel CLI. |
| APM | `npm run validate:packages` | Offline portable-plugin pack, compatibility-bundle installation into a temporary Copilot consumer, shared-path projection, byte-for-byte source comparison, and CI audit. |

Markdown rule `MD013` is disabled because arbitrary line wrapping makes prose diffs noisy. The custom `no-hard-wrapped-prose` rule enforces the positive convention: one logical prose paragraph per source line. Custom Markdown rules belong in `.markdownlint-rules.cjs`; non-Markdown repository checks belong in `scripts/`.

`CLAUDE.md` is excluded from Markdown lint because its entire content is Claude Code's supported `@AGENTS.md` import directive rather than a standalone Markdown document.

Add a custom rule only when it protects an objective repository invariant, upstream tooling does not already enforce it, and the failure message tells contributors how to recover. Keep CI as an invocation of local commands rather than a second implementation of validation.
