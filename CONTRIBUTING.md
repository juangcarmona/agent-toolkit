# Contributing

Contributions should improve a concrete reusable capability, its validation, or its distribution. Open-ended taxonomies and placeholder capabilities are intentionally out of scope.

## Before authoring

1. Read [`AGENTS.md`](AGENTS.md).
2. For skills, follow [`docs/authoring/skills.md`](docs/authoring/skills.md).
3. Confirm that the proposed material is reusable and belongs in this repository rather than a consuming project's instructions.
4. Confirm that the contribution is original or that its license and attribution permit redistribution under this repository's terms.

## Validate a change

```shell
npm install
npm run setup:validation
npm run validate
```

CI runs the same `npm run validate` workflow. Do not bypass an upstream validator with a local exception unless the upstream behavior and the reason for the exception are documented.

## Change discipline

- Keep commits focused and make generated changes reviewable.
- Do not commit harness projections, local virtual environments, dependencies, credentials, or secrets.
- Add a repository-specific validation rule only for an objective invariant that upstream tooling does not enforce.
- Update the relevant decision record when changing a consequential architectural choice.
