# Agent capability ecosystem research

Status: researched on 2026-09-19 against the current public documentation and the following repository revisions:

- `agentskills/agentskills`: `69ef37e9424c0a7ea9dd2293b559e43ec8176379`.
- `vercel-labs/skills`: `7407f3893ad4dceab546ac002c3ef806e4000c73` (`skills` CLI 1.7.0).
- `microsoft/apm`: `98616b9430140275a3a7c8fefb25d8d111cecc4e` (`apm-cli` 0.31.0 in `pyproject.toml`).
- `mattpocock/skills`: `c55ee46073ed923f86ce59a5eb3b6d895095d1b7`.

This note records ecosystem facts and their architectural consequences. It is not a legal opinion and does not copy third-party skill content.

## Executive conclusion

For a repository whose primary public unit is a collection of Agent Skills, root `skills/<name>/SKILL.md` is the strongest current canonical location.

The reason is asymmetric interoperability: APM officially recognizes both `.apm/skills/<name>/` and root `skills/<name>/`, but the Vercel `skills` CLI gives root `skills/` first-class priority while `.apm/skills/` is only found by an undocumented recursive fallback. A repository containing only `.apm/skills/` works with CLI 1.7.0 today, but adding any skill in a priority location makes default whole-repository discovery omit the `.apm` skills. That behavior is too fragile to make `.apm/skills/` the canonical public collection.

This conclusion does not reject APM. It means APM composition should consume the canonical root skills without copying them. APM package manifests may live at a package boundary that references canonical skill directories, or the repository can initially use APM's supported root `skills/` collection layout. Do not add a root `.apm/` directory alongside canonical root `skills/` and expect both to pack: APM makes `.apm/` authoritative and warns that root sources were skipped.

## Agent Skills specification

The [Agent Skills specification at the inspected revision](https://github.com/agentskills/agentskills/blob/69ef37e9424c0a7ea9dd2293b559e43ec8176379/docs/specification.mdx#L6-L247) defines an individual skill as a directory containing a required `SKILL.md`; `scripts/`, `references/`, and `assets/` are recommended optional conventions, not an exhaustive directory schema.

### `SKILL.md`

- `SKILL.md` is YAML frontmatter followed by Markdown.
- Required `name`: 1-64 characters, lowercase letters, digits, and hyphens; no leading, trailing, or consecutive hyphens; it must match the parent directory name.
- Required `description`: 1-1024 characters and should say both what the skill does and when to use it, with useful retrieval keywords.
- Optional `license`: a short license name or reference to a bundled license file.
- Optional `compatibility`: 1-500 characters describing genuine environment requirements such as products, system packages, or network access. The specification says most skills do not need it.
- Optional `metadata`: a string-to-string mapping for namespaced client-specific metadata.
- Optional `allowed-tools`: a space-separated list of pre-approved tools. It is explicitly experimental and client support varies.
- The body has no normative section schema. Step-by-step instructions, examples, and edge cases are recommendations, not required headings.

### Progressive disclosure and resources

The specification defines three disclosure levels: metadata at startup, the full `SKILL.md` after activation, and supporting resources only when needed. It recommends fewer than 5,000 tokens and fewer than 500 lines in `SKILL.md`, focused reference files, relative paths from the skill root, and shallow reference chains. These are authoring recommendations rather than validator-enforced size limits.

Scripts are executable code whose runtime support depends on the consuming agent. They should be self-contained or document dependencies and should handle errors and edge cases. Merely placing a script in `scripts/` does not standardize how or whether a harness executes it.

### Validation and collection layout

The specification page uses `skills-ref validate ./path/to/skill`. In the published `skills-ref` Python package 0.1.1, the console command is named `agentskills`, so the executable form tested here is `agentskills validate ./path/to/skill`. The [reference implementation at the inspected revision](https://github.com/agentskills/agentskills/tree/69ef37e9424c0a7ea9dd2293b559e43ec8176379/skills-ref) checks frontmatter and naming constraints, but its own README says it is for demonstration and not production. It is useful as the upstream conformance layer, but should not be the repository's only quality gate.

The Agent Skills specification standardizes an individual skill directory, not the layout, manifest, versioning, or publication process for a repository containing many skills. Its [client implementation guide](https://github.com/agentskills/agentskills/blob/69ef37e9424c0a7ea9dd2293b559e43ec8176379/docs/client-implementation/adding-skills-support.mdx#L32-L91) recommends `.agents/skills/` as a cross-client installed location alongside native client paths; this is a consumption convention, not a collection-authoring requirement. Collection discovery is therefore a distributor convention, not a guarantee of the base specification.

There is a minor specification/reference-validator ambiguity around non-ASCII lowercase alphanumeric names: the prose refers to Unicode while its examples and shorthand describe `a-z` and `0-9`, and the validator uses Python `isalnum()`. An ASCII kebab-case repository rule would be defensible for portability but should be identified as deliberately stricter than the current reference validator.

## skills.sh and the Vercel `skills` CLI

[skills.sh documentation](https://www.skills.sh/docs) says the directory is powered by the open-source [`skills` CLI](https://github.com/vercel-labs/skills), and that its leaderboard is ranked from anonymous CLI installation telemetry. It does not document a separate repository publication command. A public repository becomes installable through the CLI; directory visibility is an ecosystem service, not part of the Agent Skills specification.

### Sources and installation

The CLI accepts GitHub shorthand and URLs, GitLab, Azure Repos, arbitrary Git/SSH URLs, direct repository subpaths, local paths, direct `SKILL.md` URLs, and supported archives. See the [CLI README at the inspected revision](https://github.com/vercel-labs/skills/blob/7407f3893ad4dceab546ac002c3ef806e4000c73/README.md).

- `npx skills add owner/repo` discovers the repository's skills and interactively selects skills and agents.
- `--list` lists discoveries without installation.
- `--skill <name>` installs individual skills; `--skill '*'` selects the complete discovered collection.
- A GitHub tree URL can target one skill directory directly.
- `--all` selects all skills and all agents non-interactively.
- Project installs are the default; `--global` installs at user scope.
- The normal multi-agent installation uses one canonical local copy and symlinks agent-specific locations; `--copy` requests independent copies where symlinks are undesirable.

The supported-agent table is broad and currently includes Claude Code, GitHub Copilot, Codex, Cursor, Gemini CLI, OpenCode, Windsurf, Kiro, Cline, Amp, and many others, with per-agent project and global paths. This is CLI adapter support, not proof that every harness interprets every skill feature identically.

### Exact discovery behavior: `skills/` versus `.apm/skills/`

The decisive evidence is the CLI source:

- [`src/skills.ts` lines 252-312](https://github.com/vercel-labs/skills/blob/7407f3893ad4dceab546ac002c3ef806e4000c73/src/skills.ts#L252-L312) builds priority locations from the repository root, root `skills/`, curated/experimental/system children, and known harness skill directories. `.apm/skills/` is absent.
- The same code performs a recursive search only when priority discovery found no skills or the caller enabled `--full-depth`.
- [`src/blob.ts` lines 303-433](https://github.com/vercel-labs/skills/blob/7407f3893ad4dceab546ac002c3ef806e4000c73/src/blob.ts#L303-L433) mirrors this logic for the GitHub tree fast path: `.apm/skills/` is not a priority prefix, and fallback accepts `SKILL.md` paths only within its depth limit.

Consequences:

| Repository shape | CLI 1.7.0 whole-repository result | Support quality |
| --- | --- | --- |
| Only `skills/<name>/SKILL.md` | Discovered through a named priority container | Documented and first-class |
| Only `.apm/skills/<name>/SKILL.md` | Discovered by recursive fallback | Works today, but undocumented and incidental |
| Both root `skills/` and `.apm/skills/` | Default discovery returns priority root skills and omits `.apm` skills | Unsafe as a mixed canonical layout |
| Direct path to one `.apm/skills/<name>` | The targeted directory contains `SKILL.md` and is discoverable | Viable for an explicit install URL, not collection discovery |

A local scratch test with the published CLI confirmed the source behavior:

```text
npx -y skills@latest --version
1.7.0

npx -y skills@latest add ./.research-fixture-apm-only --list
Found 1 skill: apm-only-skill

npx -y skills@latest add ./.research-fixture-mixed --list
Found 1 skill: root-skill
```

The mixed fixture also contained `.apm/skills/apm-hidden-skill/SKILL.md`; it was not listed. The scratch fixtures were deleted after the test.

### CLI validation and provenance

CLI discovery is not full Agent Skills conformance validation. [`parseSkillMd`](https://github.com/vercel-labs/skills/blob/7407f3893ad4dceab546ac002c3ef806e4000c73/src/skills.ts#L75-L127) requires parseable YAML plus string `name` and `description`; it does not enforce the full specification's name length, hyphen, parent-directory match, compatibility, or metadata constraints. Use an upstream specification validator separately.

Project installs write a versioned, deterministic `skills-lock.json` intended for source control. Each entry records source, optional source URL/ref/path, source type, and a content-derived folder hash; see [`src/local-lock.ts`](https://github.com/vercel-labs/skills/blob/7407f3893ad4dceab546ac002c3ef806e4000c73/src/local-lock.ts). Global installs use an XDG-state or `~/.agents/.skill-lock.json` file and GitHub tree/folder hashes; see [`src/skill-lock.ts`](https://github.com/vercel-labs/skills/blob/7407f3893ad4dceab546ac002c3ef806e4000c73/src/skill-lock.ts).

These lockfiles support provenance and update detection, but their hashes are not package-manager-style immutable source pins. Restore refetches the recorded source/ref, so an unpinned default branch can yield newer content; see the current [project restore implementation](https://github.com/vercel-labs/skills/blob/7407f3893ad4dceab546ac002c3ef806e4000c73/src/install.ts#L9-L96). They are distinct from APM's resolved dependency graph and integrity lockfile.

## Microsoft Agent Package Manager

The primary sources are the [APM documentation](https://microsoft.github.io/apm/), [repository](https://github.com/microsoft/apm), [package-authoring guide](https://microsoft.github.io/apm/producer/), and [OpenAPM v0.1 specification](https://microsoft.github.io/apm/specs/openapm-v01/).

APM's current manifest documentation is a v0.3 working draft implemented by the current CLI; OpenAPM v0.1 is the ratified contract. The [manifest schema](https://microsoft.github.io/apm/reference/manifest-schema/) says to omit `$schema` for the current working draft or select the v0.1 schema URI explicitly. A repository should pin the CLI used in CI because working-draft behavior can evolve.

### Package structure and primitives

An APM package uses `apm.yml` for identity, version, dependencies, target selection, compilation, scripts, policy, and optional marketplace authoring. `name` and `version` are the only parse-time required top-level fields; package descriptions and license declarations are still important for public distribution.

APM manages instructions, prompts, agents, skills, hooks, commands, plugins, and MCP server declarations. The [primitive catalogue](https://microsoft.github.io/apm/concepts/primitives-and-targets/) establishes these source conventions:

| Concept | Canonical APM source | Important boundary |
| --- | --- | --- |
| Instructions | `.apm/instructions/*.instructions.md` | `apm compile` turns these into root context/rule files |
| Prompts | `.apm/prompts/*.prompt.md` | Callable, parameterized workflows |
| Commands | The same `.apm/prompts/*.prompt.md` files | There is no separate `.apm/commands/` source directory |
| Agents | `.apm/agents/*.agent.md` | Target support varies |
| Skills | `.apm/skills/<name>/SKILL.md`, root `SKILL.md`, or a root `skills/<name>/` collection | Agent Skills format, resources stay beside the skill |
| Hooks | `.apm/hooks/*.json` or top-level `hooks/` | Harness-specific runtime events |
| MCP | `apm.yml` under `dependencies.mcp` | Configuration and executable trust boundary, not a Markdown primitive |
| Plugin | `plugin.json` or ecosystem manifest | Packaging/composition format, not another copy of a primitive |

APM recognizes several package root signals. The critical collection rules are documented in [Package Authoring](https://github.com/microsoft/apm/blob/98616b9430140275a3a7c8fefb25d8d111cecc4e/packages/apm-guide/.apm/skills/apm-usage/package-authoring.md#supported-package-layouts):

- `.apm/` means multiple independent primitives that are hoisted into target directories.
- A root `SKILL.md` is a single skill bundle; with `apm.yml` it is a hybrid skill bundle with dependencies.
- `skills/<name>/SKILL.md` is a multi-skill collection whose nested skills are promoted individually.
- A plugin manifest is normalized into primitives unless an eligible APM layout takes precedence.

For APM alone, `.apm/<type>/` is the recommended producer layout because it is symmetric between `apm install` and `apm pack`. However, [pack source selection](https://microsoft.github.io/apm/producer/pack-a-bundle/#source-layout-and-install-time-discovery) makes `.apm/` authoritative when present. Without `.apm/`, supported root plugin-native directories, including `skills/`, are pack sources. A mixed root warns and skips root sources rather than merging them. This is why a cross-ecosystem repository should not duplicate skills into both trees.

### Dependencies, monorepos, and lockfile

Dependencies live under `dependencies.apm`, `dependencies.mcp`, and `dependencies.lsp`; parallel `devDependencies` are author-only and excluded from pack output. APM accepts Git shorthands and URLs, refs, local paths, single-file references, and virtual subdirectories into monorepos. The [install guide](https://microsoft.github.io/apm/consumer/install-packages/) describes transitive resolution, pre-deploy scanning, target integration, and lockfile generation.

`apm install` writes `apm.lock.yaml` with exact resolved commits, content hashes, dependency relationships, and deployed file ownership. The lockfile is generated and should not be hand-edited; commit it, while `apm_modules/` is a rebuildable cache and should be ignored. `apm install --frozen` is the CI-oriented replay mode that fails when the lock is missing or inconsistent.

APM supports a root manifest plus per-package manifests for an advanced monorepo, and virtual subdirectory references allow consumers to select a package or skill from a larger repository. The [repo-shapes guide](https://microsoft.github.io/apm/producer/repo-shapes/) recommends starting with one package and introducing per-plugin subdirectories only when independent plugin composition is real.

### Compile, preview, validate, and pack

There is no generic `apm validate` command. The current checks are purpose-specific:

- `apm compile --validate` checks primitive frontmatter and structure without generating outputs.
- `apm compile --dry-run --target ...` previews instruction placement.
- `apm preview [script]` is narrower than its name suggests: it compiles `.prompt.md` arguments in an `apm.yml` script and shows the command line without launching the runtime; it is not a general package preview. See the [`apm preview` reference](https://microsoft.github.io/apm/reference/cli/preview/).
- `apm view <package>` reports an installed package's metadata and primitive counts; testing an in-development package requires installing its local path in a scratch consumer.
- `apm audit` scans hidden Unicode and detects deployment drift; `apm audit --ci` adds the CI baseline and applicable policy checks.
- `apm marketplace validate` or `apm marketplace check` covers marketplace structure and resolvable package references.
- The [producer verification sequence](https://microsoft.github.io/apm/producer/preview-and-validate/) is `compile --validate`, `compile --dry-run`, scratch install/view, dependency freshness, audit, then pack.

`apm compile` handles instructions, not all primitives. It writes target-specific root context and rule files; `apm install` deploys skills, prompts, agents, hooks, commands, and MCP configuration. Pinning `targets:` in `apm.yml` makes generated output deterministic instead of depending on local harness-directory auto-detection.

`apm pack` creates a distributable plugin directory or archive with `plugin.json`, primitive directories, and an embedded integrity lock. The default is a Claude Code plugin layout. `--format agent-plugin` creates the stricter portable Agent Plugins v1 core (`plugin.json`, `skills/`, and `mcp.json`) and rejects primitives that format cannot represent. APM can synthesize `plugin.json` from `apm.yml`; author a separate one only when fields APM cannot synthesize are genuinely required. See [Pack a bundle](https://microsoft.github.io/apm/producer/pack-a-bundle/).

### Targets and portability boundary

APM's [targets matrix](https://microsoft.github.io/apm/reference/targets-matrix/) currently covers Copilot, Claude, Grok Build, Cursor, Codex, Gemini, Antigravity, OpenCode, Windsurf, Kiro, Agent Skills, and explicit Hermes support, with several experimental targets. Skills have the broadest reach and converge to `.agents/skills/` for many targets; instructions can be compiled to root context/rule formats; prompts, agents, hooks, and commands have uneven support.

APM therefore proves routing and format transformation, not behavioral equivalence. Cross-harness smoke tests remain useful for activation, relative resource loading, tool-policy behavior, and bundled script execution. A lightweight bootstrap should validate source structure and APM projections; real behavioral tests can wait for real capabilities.

### Versioning and CI

APM supports repository-wide and granular release shapes without requiring an early commitment. The [versioning guide](https://microsoft.github.io/apm/producer/versioning-strategies/) defines:

- `lockstep` (default): all local packages match the root version and one tag releases them together.
- `tag_pattern`: per-package versions with unique rendered tags in one shared repository.
- `per_package`: each local package declares a version, while tag/release orchestration is external.

Git dependencies can be pinned by tag, commit, branch, or semver-style constraint; the resolved tag/commit remains in `apm.lock.yaml` until update. Individual skill installation through the skills CLI instead tracks the repository ref and skill path in `skills-lock.json`. The two versioning models are complementary but not interchangeable.

The [APM CI release guidance](https://microsoft.github.io/apm/producer/releasing-from-any-ci/) uses `apm pack --check-versions --check-clean --json` as read-only release gates, a second strict pack, SHA-256 sidecars, and a tagged release. `microsoft/apm-action@v1` is a convenience wrapper, not a required platform. Release automation is unnecessary at bootstrap; validation should use a pinned CLI and the same commands locally and in CI.

## Reference repository findings

### `mattpocock/skills`

[`mattpocock/skills`](https://github.com/mattpocock/skills/tree/c55ee46073ed923f86ce59a5eb3b6d895095d1b7) keeps one canonical, categorized root `skills/` tree. Its Claude plugin manifest points directly to those existing skill directories, avoiding copied plugin payloads. The repository distinguishes promoted, in-progress, miscellaneous, and deprecated skills, and its repository instructions require catalog and plugin-manifest consistency.

It uses Changesets plus a small version-sync check for repository/plugin versioning. At the inspected revision, its `package.json` does not provide general Markdown, Agent Skills, link, or semantic validation. The useful precedent is the single-source composition and explicit lifecycle buckets, not its validation depth.

### `vercel-labs/skills`

[`vercel-labs/skills`](https://github.com/vercel-labs/skills/tree/7407f3893ad4dceab546ac002c3ef806e4000c73) is primarily the distribution CLI, not a broad skill catalog. It contains extensive unit tests, archive/path-traversal protections, deterministic lock behavior, formatting/type checks, and a Linux/Windows, multi-Node CI matrix. Its own sample skill lives under root `skills/`.

The strongest precedent for this toolkit is to test distribution assumptions against source and released behavior. The `.apm/skills/` fallback finding above is exactly the kind of edge case that a nominal `SKILL.md`-only review would miss.

### `microsoft/apm`

[`microsoft/apm`](https://github.com/microsoft/apm/tree/98616b9430140275a3a7c8fefb25d8d111cecc4e) dogfoods `apm.yml`, `apm.lock.yaml`, `.apm/`, generated target surfaces, schemas, conformance records, and a tiered unit/integration/release-validation pipeline. It pins many GitHub Actions by commit SHA and publishes extensive package/lock/policy specifications.

The repository is a package-manager implementation, so its scale should not be copied into a new content toolkit. Its useful patterns are explicit schemas, generated-output ownership, scratch consumer tests, lock integrity, CI parity, and documentation that distinguishes stable, working-draft, and experimental surfaces.

## Security and trust boundaries

Installing agent instructions is security-sensitive even when no traditional package installation script runs. A harness may ingest a newly placed instruction immediately, and a skill can instruct the agent to run bundled executable scripts or consume untrusted references.

The [skills.sh security statement](https://www.skills.sh/docs#how-are-you-securing-skills) says skills receive routine audits but explicitly does not guarantee quality or safety and tells consumers to review before installing.

APM provides useful baseline controls: exact commit and content hashes, pre-deploy hidden-Unicode scanning, target/file ownership, explicit trust for transitive MCP, and lockfile auditability. Its [security model](https://microsoft.github.io/apm/enterprise/security/) also states its limits: it does not detect visible prompt injection, homoglyphs, semantic manipulation, or binary payloads; it does not sandbox runtime MCP servers or agent actions; and package signing/SLSA provenance are not current guarantees.

Project lifecycle scripts are skipped until explicitly trusted, and edits to the lifecycle block revoke that trust; see [Lifecycle Scripts](https://microsoft.github.io/apm/enterprise/lifecycle-scripts/). That gate does not make an ordinary skill's `scripts/` safe. Consumers still need source review and runtime/tool least privilege.

Reasonable bootstrap policy:

- Treat third-party skills and references as untrusted dependencies; review their full directory, not only `SKILL.md`.
- Do not execute skill scripts during structural validation. Tests should use explicit fixtures or sandboxed invocations.
- Require declared dependencies and avoid secrets, credentials, machine-specific paths, or network tokens in skills and package manifests.
- Commit lockfiles that represent intended consumption, pin CI dependencies, and regenerate artifacts rather than hand-editing them.
- Keep generated target surfaces clearly owned so local instructions are never silently overwritten.
- Document network, package, tool, and executable requirements in `compatibility` or authoring documentation.

## Licensing implications

The Agent Skills specification permits a short `license` field or a reference to a bundled license file. APM records the manifest's declared license but does not infer it from `LICENSE` text or prove that the declaration is correct; see the [manifest license field](https://microsoft.github.io/apm/reference/manifest-schema/#35-license).

The [MIT License](https://opensource.org/license/mit) is short and permissive, but copies or substantial portions must retain the copyright and permission notice. The [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) is also permissive and adds an explicit patent grant, modified-file notice requirements, and preservation of applicable `NOTICE` attributions.

Practical implications for this repository:

- Original skills, scripts, examples, and documentation can share the repository license, with an optional skill-level `license` only when clarity or a different license requires it.
- Copied or adapted third-party material remains governed by its upstream license. Preserve required notices, mark substantive modifications where required, and record provenance. A repository-wide license cannot erase upstream conditions.
- A link or factual reference to third-party documentation is different from copying its expression. Prefer original instructions backed by citations over vendoring prose.
- Bundled scripts and assets need the same provenance review as Markdown. Do not assume a skill repository's license covers external examples, datasets, fonts, or images it happens to reference.
- MIT minimizes contribution and redistribution ceremony. Apache-2.0 is preferable when an explicit patent grant is an important project policy, at the cost of more notice discipline. Choose after confirming the copyright holder and contribution policy; do not copy a reference repository's license merely because its layout was studied.

## Architectural evidence matrix

| Question | Evidence | Implication |
| --- | --- | --- |
| Does Agent Skills require a collection directory? | The specification defines each skill directory, not a repository collection layout | Distribution tools decide collection discovery |
| Does APM support root `skills/`? | Package authoring recognizes `skills/<name>/SKILL.md` as a collection | Root skills remain valid APM input |
| Does APM prefer `.apm/skills/`? | Producer guidance calls `.apm/<type>/` the symmetric layout; `.apm/` wins source selection when present | Best for an APM-only package, but it preempts root source directories |
| Does the skills CLI officially scan `.apm/skills/`? | It is absent from priority locations in both local and GitHub-tree discovery | No; current success is fallback behavior |
| Can one canonical tree serve both ecosystems? | Root `skills/` is first-class in the CLI and recognized by APM | Yes; prefer root `skills/` for this repository |
| Should packages copy skills into `.apm/skills/`? | Both tools can consume canonical root skills and APM resolves local/virtual subdirectories | No; package composition must reference canonical sources |
| Is one upstream validator sufficient? | `skills-ref` is demonstration software and the skills CLI performs only minimal discovery validation | Layer upstream validation with repository structure, links, and package checks |

## Remaining uncertainties to track

- skills.sh does not currently promise `.apm/skills/` discovery as a public contract; a future explicit manifest or `.well-known` collection mechanism could change the trade-off.
- APM's current manifest reference is a working draft while OpenAPM v0.1 is the ratified base; CLI pinning and periodic compatibility tests are necessary.
- Behavioral parity across harnesses is not specified by Agent Skills or guaranteed by APM's routing matrix.
- Package granularity and release strategy should wait for the first real composed package; the current layout must leave room for package-local manifests without copying canonical skills.
