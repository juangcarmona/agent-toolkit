# Architecture

Agent Toolkit separates portable capability source from composition and harness projection.

```text
skills/<name>/                 canonical Agent Skill source
        |
        +--> skills CLI       individual discovery and installation
        |
        +--> APM              composition, locking, packing, target projection
        |
        +--> packages/<name>/skills/   shared-skill dependencies (git + skills subset)

packages/<name>/               cohesive multi-primitive packages (plugin.json + apm.yml)
        |
        +--> APM              package install, dependency resolution, projection
```

The Agent Skills specification defines what is inside a skill but does not prescribe a source repository layout. The Vercel skills CLI discovers repository collections under `skills/`, while APM recognizes `skills/<name>/SKILL.md` as a multi-skill package. This common denominator avoids copies, symlinks, generated source mirrors, and vendor-specific discovery manifests. The full rationale is recorded in [ADR 0001](decisions/0001-canonical-skill-location.md).

## Source-of-truth map

| Concept | Canonical location | Notes |
| --- | --- | --- |
| Repository instructions | `AGENTS.md` | `CLAUDE.md` imports it; no duplicated handbook. |
| Reusable skills | `skills/<name>/` | One flat, portable collection. |
| Cohesive multi-primitive packages | `packages/<name>/` | Self-contained systems (skills + commands + agents) with their own `plugin.json` and `apm.yml`; see [ADR 0002](decisions/0002-nested-plugin-packages.md). Current packages: `agentic-sdlc` (delivery lifecycle) and `product-definition` (product-definition capability with the `product-engineer` advisory agent). |
| Shared skills | `skills/<name>/` referenced by a package's `apm.yml` git dependency with a `skills:` subset | One canonical copy; packages receive them through a locked dependency instead of duplication. |
| Reusable instructions | Not created yet | Add under `.apm/instructions/` only when a concrete APM-composed instruction exists. |
| Prompts and commands | Not created yet | Add an APM source location only for a concrete explicit entry point. |
| Agents | Not created yet | Add an APM source location only when isolated execution is essential. |
| Package definitions | `apm.yml` | It declares the current publication boundary; future composed packages may get their own manifests. |
| Authoring guidance | `docs/authoring/skills.md` | Repository guidance complements, rather than replaces, the standard. |
| Validation rules | `.markdownlint-cli2.jsonc`, `.markdownlint-rules.cjs`, and `scripts/` | Upstream validators run before repository-specific rules. |
| Generated artifacts | `apm.lock.yaml` and `package-lock.json` | Reproducibility lockfiles are committed; build output, installed modules, and harness projections are ignored. |

## Primitive boundaries

A skill is appropriate for reusable knowledge or a repeatable workflow that should load on demand. Always-on scoped policy belongs in an instruction. An explicit invocation surface belongs in a prompt or command. An agent exists for isolation or delegation. A hook exists for deterministic lifecycle automation. Packages and plugins compose and distribute these primitives; they do not own copied implementations.

The repository currently contains only skills because no other primitive has yet justified a canonical source directory. When one does, APM's `.apm/<primitive>/` source convention can coexist with root `skills/`; the presence of `.apm/` changes APM's authoritative pack source, so that transition must include an explicit manifest boundary and a new compatibility test.

## Deferred evolution

Repository-wide tags are sufficient for the bootstrap. APM supports Git references and lock files, while skills CLI records source path and content hashes in its installed-skill lock. Per-package versions and independent tags should be introduced only when packages acquire independent consumers and release cadence.

APM already maps supported primitives into target-specific locations. It does not prove that every harness interprets a capability identically. Broader portability testing should therefore add small install-and-activation smoke tests per claimed harness, not a large synthetic compatibility framework.

## License

The bootstrap uses MIT for original skills, documentation, examples, and validation scripts. MIT matches the intended low-friction reuse model and the repository contains no copied third-party capability content. Apache-2.0 was considered for its explicit patent grant, but its modification and notice obligations add process that this primarily textual bootstrap does not yet need. Reconsider the choice before accepting patent-sensitive executable components or material under licenses with additional obligations.
