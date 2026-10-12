# Agent Toolkit

Agent Toolkit is a local-first repository for reusable agent capabilities. It keeps portable Agent Skills as canonical source and uses Microsoft Agent Package Manager (APM) as a composition and distribution layer without maintaining harness-specific copies.

The catalog contains seventeen root skills — authoring and review ([`agent-skill-authoring`](skills/agent-skill-authoring/SKILL.md)), document conversion ([`document-to-markdown`](skills/document-to-markdown/SKILL.md)), decision records and architecture documentation ([`adr`](skills/adr/SKILL.md), [`architecture-docs`](skills/architecture-docs/SKILL.md)), product definition ([`product-definition`](skills/product-definition/SKILL.md), from lightweight Markdown to full [PDaC](https://pdac.dev/spec/)), refinement and research ([`refining`](skills/refining/SKILL.md), [`refine-with-docs`](skills/refine-with-docs/SKILL.md), [`research`](skills/research/SKILL.md)), writing ([`writing-fragments`](skills/writing-fragments/SKILL.md), [`writing-shape`](skills/writing-shape/SKILL.md), [`writing-beats`](skills/writing-beats/SKILL.md), [`writing-for-agents`](skills/writing-for-agents/SKILL.md)), presentations ([`presentation-brief`](skills/presentation-brief/SKILL.md), [`presentation-qa`](skills/presentation-qa/SKILL.md), [`slidev-deck`](skills/slidev-deck/SKILL.md)), and git safety ([`rebase-safely`](skills/rebase-safely/SKILL.md), [`git-worktrees`](skills/git-worktrees/SKILL.md)) — plus two packages under `packages/`: the [`agentic-sdlc`](packages/agentic-sdlc/README.md) lifecycle and the [`product-definition`](packages/product-definition/README.md) capability (five `/product` commands and the advisory `product-engineer` agent), each sharing skills with the root collection through APM git dependencies instead of duplicating them. The repository's discovery, validation, and packaging paths are exercised end to end.

## Install

The packages work in any harness that reads Agent Skills. Claude Code gets the complete package (commands, agents and skills); every other harness gets the skills, which carry the procedures.

**Claude Code**: add the marketplace once, then install what you want.

```text
/plugin marketplace add juangcarmona/agent-toolkit
/plugin install agentic-sdlc@agent-toolkit
/plugin install product-definition@agent-toolkit
```

Each package installs the shared skills it uses (`adr`, `rebase-safely` and `git-worktrees` for `agentic-sdlc`; the `product-definition` skill for the `product-definition` package) as dependency plugins, so nothing is copied and nothing is missing. Commands are namespaced by the plugin, for example `/agentic-sdlc:refine`, and the agents are `done-gate-auditor`, `flow-reporter` and `product-engineer`. The shared skills are also available alone, for example `/plugin install adr@agent-toolkit`.

**Codex, Copilot and any other harness**: install the skills with the [skills CLI](https://github.com/vercel-labs/skills), choosing your harness with `-a`. Install the package's own skills, then the shared ones.

```shell
npx skills add juangcarmona/agent-toolkit/packages/agentic-sdlc -a codex
npx skills add juangcarmona/agent-toolkit --skill adr --skill rebase-safely --skill git-worktrees -a codex
```

Without commands, ask for a stage by name ("refine PROJ-123"); the skills' descriptions route the request. Agents are a Claude Code feature: elsewhere, run the agent's file as a prompt in a fresh session. The Done gate depends on that independence, so do not run it in the session that wrote the change.

**APM**: `apm install juangcarmona/agent-toolkit/packages/agentic-sdlc` projects the skills. APM currently classifies these packages as skill bundles, so it does not deploy their commands or agents; use the Claude Code route above for those.

## Standards and tools

- [Agent Skills](https://agentskills.io/specification) defines each skill's portable directory format.
- [skills CLI](https://github.com/vercel-labs/skills) discovers and installs individual skills from `skills/`.
- [Microsoft APM](https://github.com/microsoft/apm) validates composition and projects canonical primitives into target harnesses.
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) enforces Markdown quality, including this repository's one-paragraph-per-line convention.

See [architecture](docs/architecture.md) for the source-of-truth map and [distribution](docs/distribution.md) for the verified compatibility boundary.

## Local setup and validation

Requirements are Node.js 24 or newer, npm, Python 3.10 or newer, and Git.

```shell
npm install
npm run setup:validation
npm run validate
```

`npm run validate` is the CI-equivalent entry point. Narrower checks are documented in [validation](docs/validation.md).

To inspect local skills through the Vercel CLI without installing them:

```shell
npx skills add . --list
```

## Contributing

Read [`AGENTS.md`](AGENTS.md) for repository instructions and [`docs/authoring/skills.md`](docs/authoring/skills.md) before creating or substantially changing a skill. Contributions must be original or have compatible, documented licensing; do not copy proprietary or ambiguously licensed material.

This repository is licensed under the [MIT License](LICENSE).
