# ProductShape CLI Reference

The verified command surface of [ProductShape](https://github.com/juangcarmona/productshape) (`@prodshape/cli`, the PDaC reference implementation), as of the supported published baseline `0.20.0`. ProductShape is optional: the skill reasons from canonical Markdown when it is absent, and structural facts come from these commands — never from re-deriving them by reading state files — when it is present.

## Commands

| Command | What it does |
| --- | --- |
| `prodshape init` | Scaffold a product definition (and optional AI, OpenSpec and Spec Kit integrations) in any repository |
| `prodshape validate` | Validate the definition deterministically: schemas, IDs, relationships, lifecycles, stable diagnostic codes. `--format json` for machine-readable output |
| `prodshape graph` | Compile the product graph from the Markdown. `--format json` or `--format html` (snapshot) |
| `prodshape impact <ID>` | Answer "what is connected to this?" structurally. `--depth n`, `--direction incoming\|outgoing\|both` |
| `prodshape inspect <ID>` | Show one artifact with its resolved relationships |
| `prodshape template <kind>` | Print a conformant starting point for an artifact kind |
| `prodshape schema <kind>` | Print the frontmatter contract for a kind, without a repository |
| `prodshape change create` | Create a Product Change |
| `prodshape change list` | List Product Changes |
| `prodshape change validate <chg-id>` | Validate a change as an overlay against the baseline |
| `prodshape change apply <chg-id>` | Apply an approved change to the working tree (never merges, never commits) |
| `prodshape cite --id <ID> --digest <digest>` | Generate a citation payload. `--file <path>`, `--form sidecar-ledger` for the sidecar carrier |
| `prodshape citations verify` | Verify citations: `current`, `stale`, `tampered`, `unresolved`. `--provider <name>` for provider-aware population verification, `--format json` |
| `prodshape context <ID> [<ID>...]` | Render a cited context projection of the artifacts delivery work implements |
| `prodshape drift` | Report drift between the definition and its consumers |
| `prodshape fix --filenames` | The one mechanical remedy: rename files to their lowercase IDs |
| `prodshape snapshot` | Generate the browsable snapshot of the definition |
| `prodshape recover ...` | Brownfield recovery session subcommands (`start`, `status`, `next`, `mark`, `unmark`, `evidence`, `lead`, `question`, `family`, `check`, `report`) — the CLI owns bookkeeping; the agent owns semantics |
| `prodshape integration update` | Refresh generated AI/OpenSpec integration assets after an upgrade |
| `prodshape --version` | Report the CLI version |

## Usage discipline

- **Structural facts are authoritative from the CLI.** If `validate` reports a fact, that fact stands; do not re-derive it by reading files. This division (tools own structure, agents own semantics) is itself a governed rule in PDaC repositories that adopt it.
- **Never write citation payloads by hand.** The digest is computed by the tool; a hand-written payload is unverifiable by construction.
- **Apply is a human-triggered, explicit operation.** Never invoke it implicitly, never let a hook or archival trigger it, and never treat a successful apply as acceptance.
- **Version pinning.** The supported published baseline is `@prodshape/cli@0.20.0` (Node.js 22+). Features on `main` newer than the pinned baseline are unreleased; do not document or rely on them.
- **Generated assets are canonical to the CLI.** `prodshape init --ai claude,codex,copilot` installs generated commands and skills for the chosen providers; `prodshape integration update` refreshes them after an upgrade. In a repository that uses them, those generated assets are managed files: do not edit them by hand.

## When the CLI is absent

The skill's guidance remains applicable from canonical Markdown alone: read `docs/product/model/**` (or the general-mode structure), reason over the relationships authored in frontmatter, and classify findings per the [product review](product-review.md) reference. What is lost without tooling: deterministic validation, digest-verified citations, overlay validation of changes and impact computation. Say so when reporting: a review without the CLI is an unverified structural pass, not a clean one.
