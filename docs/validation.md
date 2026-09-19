# Validation

The single CI-equivalent command is:

```shell
npm run validate
```

Install the pinned Python tools into the repository-local `.venv` first with `npm run setup:validation`. JavaScript dependencies are locked by `package-lock.json`; direct Python validation tools are pinned in `requirements-validation.txt`.

## Layers

| Layer | Command | Responsibility |
| --- | --- | --- |
| Dependency audit | `npm run audit:dependencies` | Known vulnerabilities in the locked JavaScript validation toolchain; the gate fails on critical severity. |
| Markdown | `npm run lint:markdown` | CommonMark style, structural Markdown rules, and one-paragraph-per-line authoring. |
| Agent Skills specification | `npm run validate:skills` | Official `agentskills` reference CLI checks for frontmatter and naming, followed by canonical placement, uniqueness, and no-symlink rules. |
| Links | `npm run validate:links` | Existence of relative Markdown link targets without making network-dependent external link checks part of CI. |
| skills CLI | `npm run validate:discovery` | Discovery of every canonical skill, selected-skill installation with provenance lock generation, and complete-collection installation through the pinned Vercel CLI. |
| APM | `npm run validate:packages` | Offline portable-plugin pack, compatibility-bundle installation into a temporary Copilot consumer, shared-path projection, byte-for-byte source comparison, and CI audit. |

Markdown rule `MD013` is disabled because arbitrary line wrapping makes prose diffs noisy. The custom `no-hard-wrapped-prose` rule enforces the positive convention: one logical prose paragraph per source line. Custom Markdown rules belong in `.markdownlint-rules.cjs`; non-Markdown repository checks belong in `scripts/`.

`CLAUDE.md` is excluded from Markdown lint because its entire content is Claude Code's supported `@AGENTS.md` import directive rather than a standalone Markdown document.

Add a custom rule only when it protects an objective repository invariant, upstream tooling does not already enforce it, and the failure message tells contributors how to recover. Keep CI as an invocation of local commands rather than a second implementation of validation.
