# ADR 0002: Nested Plugin Packages and Shared Skills

- Status: Proposed
- Date: 2026-09-19
- Deciders: juangcarmona
- Tags: [architecture, distribution, apm]

## Context

The repository began as a flat collection of standalone Agent Skills under `skills/`, distributed through the Vercel skills CLI and APM's skill-collection layout. Two needs do not fit that shape:

1. A cohesive multi-primitive system — the `agentic-sdlc` lifecycle — whose commands dispatch to skills, skills delegate to agents, and agents reference skills by name. Splitting it into root-level primitives would break its internal contract, and its commands and agents have no meaning outside the lifecycle.
2. Skills that are useful both standalone and as part of the package (`adr`, `rebase-safely`, `git-worktrees`). Duplicating them under `packages/agentic-sdlc/skills/` would violate the repository's one-canonical-copy principle and drift immediately.

APM supports several source layouts. A root `.apm/` restructure would break Vercel skills CLI discovery of `skills/` and force moving every existing canonical skill, so it was rejected.

## Decision

We will introduce a `packages/<name>/` boundary for cohesive multi-primitive systems, and reference shared skills through a locked git dependency instead of copying them.

1. **Nested packages.** A cohesive system whose primitives only make sense together lives as a self-contained package under `packages/<name>/` with its own `plugin.json` and `apm.yml`. Standalone reusable skills remain in root `skills/`. A capability must never exist in both places.
2. **Shared skills by dependency.** When a package needs a skill that is also useful standalone, the skill lives in root `skills/` and the package's `apm.yml` declares a git dependency on this repository with a `skills:` subset listing it. APM resolves the dependency, records the resolved commit and `skill_subset` in the consumer's lockfile, and projects the skill alongside the package's own skills. This was verified empirically: a consumer install resolved `juangcarmona/agent-toolkit` and locked `skill_subset: [adr, git-worktrees, rebase-safely]`.
3. **Validation.** `scripts/validate-skills.mjs` recognizes `packages/<name>/skills/<skill>/SKILL.md` as a valid canonical location and validates it with the same rules as root skills, including cross-tree name uniqueness. `scripts/validate-package.mjs` smoke-tests the plugin package with `apm pack` and a consumer install.

## Consequences

- **Positive:** the lifecycle keeps its cohesion; shared skills have exactly one canonical copy; consumers installing the package receive the shared skills through a locked, content-hashed dependency; root skills remain independently installable through the skills CLI.
- **Negative:** the shared-skill dependency resolves against the published remote, so the repository must be pushed before a fresh consumer install can project the shared skills (a release-ordering constraint, not a correctness problem — the lockfile pins the commit). The `git: parent` sentinel form does not work for local-path installs because it requires transitive clone coordinates; the explicit `git: <owner>/<repo>` form is the supported spelling.
- **Neutral:** plugin-native (Claude plugin collection) installs that bypass `apm.yml` dependency resolution will not receive the shared skills; the APM route is the supported installation path and is what validation exercises.

## Alternatives considered

- **Root `.apm/` restructure:** rejected; breaks skills CLI discovery and moves every existing canonical skill.
- **Duplicate skills in both locations:** rejected; violates one canonical copy and drifts immediately.
- **`git: parent` sentinel:** rejected after empirical testing; only valid inside transitively resolved packages with known clone coordinates, which a local-path install does not have.
- **Local `path:` dependency on the repo root:** rejected after empirical testing; the path resolves relative to the materialized package in `apm_modules/`, so `../..` escapes the consumer and is refused.

## References

- [APM manifest schema — dependencies](https://microsoft.github.io/apm/reference/manifest-schema/#41-dependenciesapm--listapmdependency)
- [APM package types](https://microsoft.github.io/apm/reference/package-types/)
- [ADR 0001: Canonical skill location](0001-canonical-skill-location.md)
