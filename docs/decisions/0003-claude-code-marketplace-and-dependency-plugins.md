# ADR 0003: Claude Code Marketplace With Dependency Plugins for Shared Skills

- Status: Accepted
- Date: 2026-10-12
- Deciders: juangcarmona
- Tags: [architecture, distribution, claude-code]

## Context

[ADR 0002](0002-nested-plugin-packages.md) made APM the supported install path for nested packages and recorded that plugin-native installs would not receive the shared skills. In use, an APM install of `agentic-sdlc` deployed its skills but not its seven commands or two agents, including `done-gate-auditor`, which the package's own README calls required at the Done gate. APM classifies a package whose `apm.yml` declares dependencies and ships nested skills as a skill bundle and never reads `plugin.json`, so commands and agents were dropped. The package also had no Claude Code manifest and no documented way to install its commands and agents anywhere else, so a user who was not running APM could not use it as designed.

Behaviours verified against Claude Code 2.1.296 with a clean configuration directory:

- A marketplace plugin whose `source` is a package directory loads that directory's `commands/`, `agents/` and `skills/` automatically.
- A plugin manifest may list `dependencies` on other plugins in the same marketplace, and installing the plugin installs them.
- A marketplace entry with `source: "./"` and `strict: false` may load skills from explicit paths inside the repository, but explicit agent paths in such an entry are ignored. Agents load only from a plugin's own `agents/` directory.
- A plugin cannot reference files outside its own directory.
- An agent's `name` must be lowercase letters, digits and hyphens; a dotted name left the agent unloaded.
- Claude Code installs a plugin from the committed git tree, not the working tree.

## Decision

We will publish this repository as a Claude Code marketplace and ship each nested package as a plugin whose shared skills arrive as dependency plugins.

1. **Marketplace.** `.claude-plugin/marketplace.json` lists each package, with `source` set to `./packages/<name>`, so its commands, agents and skills load from the package directory.
2. **Package manifests.** Each package keeps its root `plugin.json` and `apm.yml` for APM and gains `.claude-plugin/plugin.json` for Claude Code, with the same name and version.
3. **Shared skills as dependency plugins.** `adr`, `rebase-safely`, `git-worktrees` and the `product-definition` skill are each published as a plugin with `source: "./"` and `strict: false` that loads the one canonical copy from `skills/`. A package declares them under `dependencies`. No skill is copied or symlinked.
4. **Agent names** are plain lowercase hyphenated names. Claude Code namespaces them by plugin.
5. **Validation.** `scripts/validate-claude-plugins.mjs` runs in `npm run validate`. It checks name and version agreement across the Claude manifest, `plugin.json` and `apm.yml`, that the shared skills a package's dependencies deliver equal the subset its `apm.yml` pulls, and agent names. When the `claude` CLI is installed it also runs `claude plugin validate`.
6. **Other harnesses** install skills with the skills CLI, which discovers a package's skills from its path. Commands and agents are Claude Code features; documentation says so.

This amends ADR 0002's statement that the APM route is the only supported install path for packages and its Neutral consequence about plugin-native installs. ADR 0002's shared-skill rule (one canonical copy, never duplicated) stands.

## Consequences

- **Positive:** A Claude Code user installs the complete package, including the agent the Done gate requires, with two commands and no tooling beyond Claude Code. Shared skills keep one canonical copy and install automatically. The metadata that both paths depend on is checked, so it cannot drift silently.
- **Negative:** Each package now carries two manifests that must agree, and the marketplace adds one dependency plugin per shared skill. Dependency plugins use `source: "./"`, so installing each caches a copy of the repository, which is acceptable at this size. Command names and same-named skills both register inside a plugin, so a command and its skill appear twice in a plugin's inventory.
- **Neutral:** APM still deploys only a package's skills and shared skills; fixing that depends on APM's package classification and is documented as a limitation. The tested behaviours belong to one Claude Code version and should be rechecked when it changes, which `claude plugin validate` in the validation script helps with.

## Alternatives considered

- **Symlink or copy the shared skills into each package:** rejected because copies drift, which ADR 0002 already rejected, and symlinks break on Windows checkouts and conflict with the no-symlink rule of `validate-skills.mjs`.
- **One plugin with `source: "./"` listing every component:** rejected because Claude Code ignores explicit agent paths, so the agents would not load.
- **Restructure packages for APM's `.apm/` layout so APM deploys commands and agents:** rejected for now because it moves every primitive and does nothing for users who do not use APM.
- **Leave APM as the only supported path:** rejected because it left the package unusable as designed for anyone not on APM.

## References

- [ADR 0002: Nested plugin packages and shared skills](0002-nested-plugin-packages.md)
- [Distribution](../distribution.md)
