# Distribution

Agent Toolkit has two complementary distribution paths over one canonical skill tree.

## Individual skills

The Vercel skills CLI scans `skills/` collections and can list or select individual capabilities. From a local clone:

```shell
npx skills add . --list
npx skills add . --skill agent-skill-authoring
```

Once a public remote exists, the same CLI can consume the repository or a direct tree URL. This repository intentionally does not publish a fictional owner/repository command before that remote exists. The CLI records installed source provenance, source-relative skill paths, and content hashes in its lock data; consumers should review updates rather than treating remote skills as trusted code.

The CLI does not currently list `.apm/skills/` among its standard repository discovery roots. Its optional full-depth scan is not a reliable default distribution contract, and a Claude marketplace manifest would introduce a vendor-specific adapter solely for discovery. These are the main reasons canonical skills live under `skills/`.

## APM packages and projections

APM recognizes `skills/<name>/SKILL.md` as a multi-skill package layout. The root [`apm.yml`](../apm.yml) provides package identity, an explicit local publication boundary, and empty dependency groups that can later compose other packages without copying primitives. Validation builds APM's portable Agent Plugins v1 format explicitly. It also builds the legacy compatibility plugin solely to exercise APM's Copilot projection into the shared `.agents/skills/` path; that compatibility format is not the repository's portability claim.

From a separate consumer checkout, a local development install can select one capability:

```shell
apm install ../agent-toolkit --skill agent-skill-authoring --target agent-skills
```

APM projects the selected skill to `.agents/skills/` for its cross-client target and records dependency resolution in `apm.lock.yaml`. Target-specific projections are generated consumer artifacts, not source files in this repository. `apm compile` concerns aggregate instruction documents; it is not needed for this skills-only package and must not overwrite the hand-authored `AGENTS.md`.

## Packages, plugins, and versions

The bootstrap manifest represents one repository package and proves composition mechanics. It pins APM's cross-client `agent-skills` target so incidental directories such as `.github/` cannot change packaging through target auto-detection. It does not establish a large package hierarchy or marketplace. Future packages should reference canonical primitives or dependencies and should never copy skill directories.

Repository tags can version the initial collection. Independent package tags or a lockstep release policy should wait until multiple packages have distinct consumers. APM locks resolved dependency references; skills CLI locks installation provenance and content. Neither mechanism replaces release notes or compatibility testing.
