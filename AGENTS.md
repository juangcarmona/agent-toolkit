# Repository Instructions

Agent Toolkit contains portable, reusable agent capabilities and the tooling that validates and distributes them. Keep the core vendor-neutral; harness-specific forms are adapters or generated outputs, not alternate sources.

## Principles

- Maintain one canonical representation for every capability.
- Put canonical Agent Skills in `skills/<name>/`; never mirror them manually under `.apm/skills/` or harness directories.
- Keep reusable capabilities free of consuming-project paths, policies, and assumptions.
- Use progressive disclosure: concise entry points should route to focused references, assets, or scripts.
- Prefer upstream standards and validators over repository-specific reinvention.
- Treat executable helpers, imported instructions, and generated artifacts as supply-chain inputs.

## Before changing the repository

- Read [`docs/authoring/skills.md`](docs/authoring/skills.md) before creating or substantially modifying a skill.
- Read [`docs/architecture.md`](docs/architecture.md) before moving canonical sources or adding a primitive type.
- Read [`docs/distribution.md`](docs/distribution.md) before changing APM or skills CLI metadata.
- Read [`docs/validation.md`](docs/validation.md) before adding or changing validation rules.

## Choose the right primitive

- Skill: reusable knowledge or an on-demand workflow.
- Instruction: always-on context or policy for a defined scope.
- Prompt or command: an explicit user-invoked entry point.
- Agent: isolated context, role, or delegated execution.
- Hook: deterministic automation at a lifecycle event.
- Package or plugin: composition and distribution metadata over canonical primitives.

Do not create a new primitive category without a concrete capability that needs it.

## Contribution contract

- Write original material or document compatible provenance and attribution.
- Use one logical prose paragraph per source line; do not hard-wrap at an arbitrary column.
- Add only files that serve a current capability or validation need.
- Run `npm run validate` before declaring a change complete.
- Update documentation and package boundaries when a source-of-truth location changes.
