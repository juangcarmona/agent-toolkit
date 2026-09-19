# Agent Toolkit

Agent Toolkit is a local-first repository for reusable agent capabilities. It keeps portable Agent Skills as canonical source and uses Microsoft Agent Package Manager (APM) as a composition and distribution layer without maintaining harness-specific copies.

The bootstrap catalog contains one working capability, [`agent-skill-authoring`](skills/agent-skill-authoring/SKILL.md), so the repository's discovery, validation, and packaging paths are exercised end to end. The repository is not published yet; remote installation commands and release guarantees would therefore be misleading.

## Standards and tools

- [Agent Skills](https://agentskills.io/specification) defines each skill's portable directory format.
- [skills CLI](https://github.com/vercel-labs/skills) discovers and installs individual skills from `skills/`.
- [Microsoft APM](https://github.com/microsoft/apm) validates composition and projects canonical primitives into target harnesses.
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) enforces Markdown quality, including this repository's one-paragraph-per-line convention.

See [architecture](docs/architecture.md) for the source-of-truth map and [distribution](docs/distribution.md) for the verified compatibility boundary.

## Local setup and validation

Requirements are Node.js 22 or newer, npm, Python 3.10 or newer, and Git.

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
