# ADR 0001: Canonical Skill Location

- Status: accepted
- Date: 2026-09-19

## Decision

Store canonical reusable Agent Skills in the flat repository collection `skills/<name>/`. Do not maintain copies under `.apm/skills/`, `.agents/skills/`, or harness-specific directories.

## Evidence

The [Agent Skills specification](https://agentskills.io/specification) standardizes the contents of each skill directory but does not require a repository collection path. The [Vercel skills CLI documentation](https://github.com/vercel-labs/skills#skill-discovery) lists `skills/` and `.agents/skills/` among its default discovery roots but does not list `.apm/skills/`. The [APM package type reference](https://microsoft.github.io/apm/reference/package-types/#skill-collection-skillsnameskillmd) recognizes `skills/<name>/SKILL.md` as a multi-skill repository and promotes each skill into the selected consumer target.

Local tests with the pinned tools confirm that Vercel skills CLI 1.7.0 discovers the collection, the Agent Skills reference CLI 0.1.1 validates each skill, and APM 0.31.0 packs and projects the same source tree.

## Alternatives considered

- `.apm/skills/<name>/`: symmetric with other APM primitive sources, but not a default skills CLI discovery root.
- `.apm/skills/` plus a generated `skills/` mirror: compatible but creates two on-disk representations and drift risk.
- `.apm/skills/` plus a `skills/` symlink: fragile on Windows and in archives, registries, and clients that do not preserve symlinks.
- `.apm/skills/` plus a Claude marketplace manifest: avoids copies but adds a vendor-specific discovery adapter to the vendor-neutral core.
- `.agents/skills/<name>/`: a strong consumer/runtime convention, but it conflates authored source with generated installation output and is less obvious to repository browsers.

## Reason

`skills/` is the only boring layout directly supported by both intended distribution systems without adapters or duplication. APM remains the composition layer through `apm.yml`, while harness projections remain generated outputs.

## Consequences

Adding `.apm/` later for non-skill primitives changes APM's authoritative local pack source. That change must explicitly include the root `skills/` boundary or introduce package references without copying skills, and the APM smoke test must prove the resulting bundle.
