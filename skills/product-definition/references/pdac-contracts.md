# PDaC Contracts

Operational summary of the PDaC kernel and reference-profile contracts. The [specification](https://pdac.dev/spec/) is authoritative; where this summary and the specification disagree, the specification wins. These rules apply **only when PDaC semantics are claimed** — they are never imposed on a general product-definition repository.

## Canonical authority

| Location | Status |
| --- | --- |
| `docs/product/model/**/*.md` | Canonical current product semantics (the accepted Product Definition) |
| `docs/product/changes/active/**/change.md` | Canonical definition of a live Product Change |
| `docs/product/changes/active/**/proposed/**/*.md` | Canonical proposed future-state artifacts |
| `docs/product/changes/{completed,rejected,superseded}/**` | Inert history; never compiled into the graph |
| Consumer documents outside the model | Non-canonical; carry citations |
| Graphs, indexes, diagrams, reports | Generated and non-canonical |

Artifact kind is determined from frontmatter `type`, never from directory layout: an implementation must inspect Markdown recursively below `model/` and must not infer or restrict kind from path. `docs/product/model/index.md` is human navigation only. Generated files must be reproducible from canonical sources; tools must not require a generated file to exist to rebuild it.

## Identifiers

Grammar: `<PREFIX>-<SEGMENT>(-<SEGMENT>)*`, uppercase, segments `[A-Z0-9]+`. Prefixes: `ACT-`, `JRN-`, `UC-`, `BR-`, `TERM-`, `BC-`, `FR-`, `QR-`, `CON-`, `SB-`, `CHG-`. An ID whose prefix does not match its `type` is invalid; IDs are unique across all kinds in one repository.

- IDs are authored by humans (assisted by AI), never tool-minted. Readability is encouraged but carries no semantics: tools treat IDs as opaque.
- An ID becomes immutable when first accepted; it is never reused, even after retirement. Title, path, body and relationships may change; the ID must not.
- Identity is the `id` field only: never inferred from file paths, and references use IDs, never paths or titles.
- `CHG-INITIAL` is reserved for the single initialisation change. `SLI-` and `HOF-` are retired prefixes and must not be reused.
- File naming: the file SHOULD be the lowercase ID plus `.md`; misalignment is a warning (`PRODUCT101`), never an identity mechanism.

## Relationships

Every relationship has exactly one canonical direction, authored on one artifact type in one frontmatter field:

| Source | Field | Target | Polarity |
| --- | --- | --- | --- |
| Journey | `primary-actor` | Actor | dependency |
| Journey | `steps[].use-case` | Use Case | dependency |
| Use Case | `primary-actor`, `supporting-actors` | Actor | dependency |
| Use Case | `bounded-context` | Bounded Context | dependency |
| Use Case | `governed-by` | Business Rule | dependency |
| Business Rule | `applies-to` | Journey, Use Case, Bounded Context | governance |
| Domain Term | `defined-in` | Bounded Context | dependency |
| Functional Requirement | `derived-from` | Use Case, Business Rule, Constraint | dependency |
| Functional/Quality Requirement | `verification[].scenario-ref` | Structured Behaviour | dependency |
| Quality Requirement | `applies-to` | Journey, Use Case, Bounded Context | governance |
| Constraint | `applies-to` (absent = entire product) | Journey, Use Case, Bounded Context | governance |
| Structured Behaviour | `illustrates` | Use Case, Business Rule, Constraint | dependency |
| Most kinds | `uses-terms` | Domain Term | dependency |

Unknown-ID references and disallowed target types are validation errors. Reverse relationships are always derived by the graph compiler and must never be authored: `Bounded Context.owns-terms` is the load-bearing case — term ownership is authored on the term (`defined-in`), and `owns-terms` is rejected by the schemas.

Polarity declares which end is put in question when the other changes: `dependency` (source cites what it builds on; target change puts source in question), `governance` (both ends coupled), `none` (Product Change operation edges record a proposal). Polarity places no obligation on an author; what tools do with it is impact analysis.

## Frontmatter

Every artifact is a Markdown file whose frontmatter MUST include `id`, `type`, `title`, `status`, and validates against the JSON Schema for its type. Unknown frontmatter properties are invalid — every kind is a closed object; if the schema does not allow it, it belongs in the body. Artifacts must not carry author, owner, date, version or review metadata: Git history is that record.

The optional `provenance` object records the evidence behind recovered knowledge — `source` (required), `confidence` (`high` read from a specification or test, `medium` inferred from structured prose, `low` inferred from indirect evidence), `recovered-from` (`observation`, `inference`, `interview`, `documentation`). Set it only on artifacts recovered from an existing system; an empty claim of provenance is worse than none. A draft with low confidence surfaces as `PRODUCT111`, making the human-validation queue derivable from validation output.

## Artifact lifecycle

`draft` → `active` → `deprecated` → `retired`. An `active` artifact must not reference a `retired` one (error); referencing a `deprecated` one should warn; `draft` may reference `draft`. This lifecycle is separate from the Product Change lifecycle and must not be mixed with it.

## Configuration

`.product/config.yaml`, discovered from the invoked path upward, first file wins, never merged. Kernel shape: `version: v1alpha1`, `product-root` (default `docs/product`), `validation.warnings-as-errors` (default `false`), `extensions`. Unknown keys outside `extensions` are invalid (`PRODUCT050`). Configuration must not suppress a normative diagnostic.

## Conformance

A repository conforms when: the definition lives in a git repository under the configured product root with the `model/` and `changes/` lifecycle directories; every artifact satisfies its contract; IDs and references satisfy their rules; baseline validation reports no errors; semantic evolution happens only through Product Changes applied explicitly and accepted by reviewed merge; live changes satisfy the change contract; citations verify per the contract; and no network service is the source of truth. The model repository may be co-located with the software (default) or dedicated, with a machine-readable pointer (repository, revision — never a branch — and product-root) in each consuming repository.
