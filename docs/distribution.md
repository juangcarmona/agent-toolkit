# Distribution

Agent Toolkit has two complementary distribution paths over one canonical skill tree, plus a nested package path for cohesive multi-primitive systems.

## Individual skills

The Vercel skills CLI scans `skills/` collections and can list or select individual capabilities. From a local clone:

```shell
npx skills add . --list
npx skills add . --skill agent-skill-authoring
```

The repository is public, so the same CLI consumes it by name: `npx skills add juangcarmona/agent-toolkit --list`. A nested package is addressed by its path, for example `npx skills add juangcarmona/agent-toolkit/packages/agentic-sdlc`, which finds the package's own skills. The CLI records installed source provenance, source-relative skill paths, and content hashes in its lock data; consumers should review updates rather than treating remote skills as trusted code.

The CLI does not currently list `.apm/skills/` among its standard repository discovery roots. Its optional full-depth scan is not a reliable default distribution contract. These are the main reasons canonical skills live under `skills/`. A Claude Code marketplace is a separate matter: it is how Claude Code users install commands and agents, which no skills-only path can deliver, so it exists for that reason alone; see [Claude Code marketplace](#claude-code-marketplace).

## APM packages and projections

APM recognizes `skills/<name>/SKILL.md` as a multi-skill package layout. The root [`apm.yml`](../apm.yml) provides package identity, an explicit local publication boundary, and empty dependency groups that can later compose other packages without copying primitives. Validation builds APM's portable Agent Plugins v1 format explicitly. It also builds the legacy compatibility plugin solely to exercise APM's Copilot projection into the shared `.agents/skills/` path; that compatibility format is not the repository's portability claim.

The architecture skill's snapshot runtime is declared file-by-file because APM recursively includes directory contents even when local `node_modules` are gitignored. Its runtime manifest and integrity lockfile ship; installed dependencies, browser caches and repository-only regression tests do not. Package validation checks runtime file fidelity and rejects dependency or test directories in the portable bundle.

From a separate consumer checkout, a local development install can select one capability:

```shell
apm install ../agent-toolkit --skill agent-skill-authoring --target agent-skills
```

APM projects the selected skill to `.agents/skills/` for its cross-client target and records dependency resolution in `apm.lock.yaml`. Target-specific projections are generated consumer artifacts, not source files in this repository. `apm compile` concerns aggregate instruction documents; it is not needed for this skills-only package and must not overwrite the hand-authored `AGENTS.md`.

## Claude Code marketplace

[`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json) makes this repository a Claude Code marketplace, and each package carries a `.claude-plugin/plugin.json`. This is the only path that delivers a package's commands and agents to Claude Code; see [ADR 0003](decisions/0003-claude-code-marketplace-and-dependency-plugins.md) for the reasoning and the behaviours it rests on.

```text
/plugin marketplace add juangcarmona/agent-toolkit
/plugin install agentic-sdlc@agent-toolkit
```

Shared skills are published as small dependency plugins (`adr`, `rebase-safely`, `git-worktrees`, `product-definition-skill`) that load a skill from the canonical `skills/` tree, and a package lists them under `dependencies`. Claude Code installs the dependencies with the package. Nothing is copied. `npm run validate:claude-plugins` checks that this metadata and `apm.yml` name the same shared skills and the same versions.

## Nested packages

Cohesive multi-primitive systems live under `packages/<name>/` with their own `plugin.json` and `apm.yml`; see [ADR 0002](decisions/0002-nested-plugin-packages.md). Two examples: the [`agentic-sdlc`](../packages/agentic-sdlc/README.md) lifecycle package (seven commands dispatching to fourteen skills and two agents that only make sense together) and the [`product-definition`](../packages/product-definition/README.md) capability package (five `/product` commands and the advisory `product-engineer` agent over the shared `product-definition` skill).

APM classifies a package whose `apm.yml` declares dependencies and ships nested skills as a skill bundle, so it deploys the package's skills and shared skills but not its `agents/` or `commands/`; use the marketplace above for those. A package can share skills with the root collection without duplicating them. Its `apm.yml` declares a git dependency on this repository with a `skills:` subset; APM resolves the dependency, pins the commit, and projects the shared skills alongside the package's own. `agentic-sdlc` uses this for `adr`, `rebase-safely`, and `git-worktrees`; `product-definition` uses it for the `product-definition` skill. The shared skills must exist on the published remote before a fresh consumer install can resolve them, so push the repository before depending on the subset.

From a consumer, declare the package and install:

```shell
# in the consumer's apm.yml
dependencies:
  apm:
    - juangcarmona/agent-toolkit/packages/agentic-sdlc
```

```shell
apm install --target agent-skills
```

### A note for adopters on linting

Installing this repository's skills or packages projects managed files into `.agents/skills/` (and, for packages, commands and agents into the target's runtime directories). Those projections are generated consumer artifacts: they are regenerated by `apm install`, not hand-edited, and this repository's Markdown lint configuration deliberately excludes them. Adopters running a repo-wide Markdown linter should exclude `.agents/` (and `apm_modules/`) the same way, or the linter will flag files the adopter does not own. This repository's scoped `.markdownlint-cli2.jsonc` files inside `packages/` are authoring-time conveniences for the package sources; they do not ship to consumers.

## Packages, plugins, and versions

The bootstrap manifest represents one repository package and proves composition mechanics. It pins APM's cross-client `agent-skills` target so incidental directories such as `.github/` cannot change packaging through target auto-detection. It does not establish a large package hierarchy. Future packages should reference canonical primitives or dependencies and should never copy skill directories.

Repository tags can version the initial collection. Independent package tags or a lockstep release policy should wait until multiple packages have distinct consumers. APM locks resolved dependency references; skills CLI locks installation provenance and content. Neither mechanism replaces release notes or compatibility testing.
