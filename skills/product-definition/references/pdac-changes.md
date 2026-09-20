# PDaC Changes and Citations

How an accepted PDaC definition evolves, and how consumers reference it without restating it. Specification chapters: [Product Changes](https://pdac.dev/spec/product-changes/), [Citation Contract](https://pdac.dev/spec/citation-contract/), [Validation](https://pdac.dev/spec/validation/). This reference operationalizes them; the specification wins on any disagreement.

## Product Changes

A requested product modification never silently edits the current model. It becomes a **Product Change**: an explicit, validated delta against the baseline recording the meaning, rationale, scope and affected artifacts of the change.

A Product Change is not a pull request, a delivery container or an implementation state. The pull request is the human review and acceptance boundary for the change; decomposing, scheduling and implementing the work belong to whatever consumes the definition.

### Structure

```text
docs/product/changes/active/<chg-id>/
├── change.md          canonical change definition
└── proposed/          complete proposed future-state artifacts (same layout as model/)
```

`change.md` frontmatter: `id` (`CHG-` prefix), `type: product-change`, `title`, `status`, `base-revision` (a git commit SHA; exactly `0000000` only for `CHG-INITIAL` with no baseline), `operations` (`add`, `modify`, `remove` — lists of artifact IDs). Required body sections, in order: Problem, Intended Product Outcome, Rationale, Affected Product Areas, Open Questions, Product Acceptance, Out of Scope. Start from the bundled [product-change template](../assets/templates/product-change.md).

### Operations

- Every ID in `add` must not exist in the baseline and must have a complete proposed artifact under `proposed/`.
- Every ID in `modify` must exist in the baseline and have a complete proposed artifact using the same ID.
- Every ID in `remove` must exist in the baseline; removals need no tombstone.
- Every artifact under `proposed/` must be listed in `add` or `modify`.

### Lifecycle

`draft` → `proposed` → `approved` → `applied`, with `rejected` (from draft or proposed) and `superseded` (from any non-terminal state) as terminal alternatives. Entering a terminal status archives the change: its directory moves to `completed/`, `rejected/` or `superseded/` — a move, not a copy, and the archived directory must agree with the status.

- `approved` is a human product decision: the change is judged correct and wanted. It authorizes apply; it says nothing about implementation, and there is no status for implementation.
- **Apply** materializes an approved change: it requires `approved` status (`PRODUCT028` otherwise), revalidates the overlay, checks baseline-revision compatibility (`PRODUCT027` on drift), writes the operations into the working tree's model, computes and reports the product diff, runs full validation, and archives the change as `applied`. Apply supports `--dry-run`, is never executed implicitly, never commits, never pushes, never merges. **Apply is not acceptance**: the accepted definition changes only when a human merges the pull request.
- An approved change with unresolved list items under `## Open Questions` produces one `PRODUCT108` warning. Resolving a question means removing its list item.
- Concurrent active changes with overlapping `modify`/`remove` sets are errors (`PRODUCT025`) until all but one is rebased or withdrawn.
- An applied and accepted change is immutable. Any later correction is a new Product Change; a superseded decision is superseded by a change, never by an edit.

### Initialisation

`CHG-INITIAL` is the single initialisation change that establishes the first definition. Greenfield and brownfield use the same mechanism: elaborate it from the knowledge available (discussions, documentation, code, tests, interviews), apply it into an empty model, accept it through review like every later change. Brownfield discovery is an input activity to `CHG-INITIAL`, not a separate lifecycle; recovered candidates carry `provenance` and low-confidence drafts queue as `PRODUCT111`. A product must not have more than one `CHG-INITIAL`.

### Change impact

The change records **intent** (its operations are authoritative for what the change meant); the product diff between baseline and applied result records the **effective change** (authoritative for what changed). They can legitimately disagree in scope; a conforming tool must not present one as the other. Impact is computed from the diff and the citation index: citations to changed artifacts become `stale`; whether that is answered by updating the citing document, planning rework or contesting the change is a decision for the consuming process.

## Citations

A citation is a machine-verifiable reference from any consumer document — an SDD spec, a task, an agent prompt, a design doc — to canonical product text. Consumers do not restate product knowledge; they cite it, so drift between consumer and model is detectable rather than silent.

### The citation record

A citation carries: `id` (the target artifact's stable ID), `digest` (the whole target artifact's content digest, SHA-256 over raw bytes with CRLF/CR normalized to LF, rendered `sha256:<lowercase hex>`), and optionally `anchor` (in v0.2, an inline verification scenario's stable `id` within the target). The anchor tells a reviewer what was relied on; the digest always covers the whole artifact, so any normalized-byte edit to the target makes the citation stale.

### Carriers

Exactly one carrier per consumer document, never both: comment payloads (`pdac:cite id="..." digest="..." [anchor="..."]`, exact attribute order, one physical line, riding inside the host format's comment syntax) or an adjacent YAML sidecar (`<stem>.citations.yml` with one top-level `citations` sequence). Never write a payload by hand: generate it with the tooling (`prodshape cite`), which owns the digest.

### Statuses

Exactly one status per citation, computed deterministically with this precedence: `unresolved` (malformed digest `PRODUCT042`, unresolvable target `PRODUCT060`, unresolvable anchor `PRODUCT063`), `tampered` (an embedded projection differs from canonical at the recorded digest, `PRODUCT062`), `stale` (target resolves but its recomputed digest differs, `PRODUCT061`, a warning), else `current`. A stale citation requires review; a tool must never renew a digest, rewrite consumer text or change the model automatically.

### Embedding

A consumer may embed cited canonical text; the opening marker carries the citation payload, the closing marker carries `/pdac:cite`, the embedded text must be byte-identical to canonical at the recorded digest, and the block is read-only and regenerable. A hand-edited embedded block stays detectable as `tampered` even after the canonical text moves.

### Delivery boundary

Consumers retain native ownership of their artifacts and workflow. A consumer must not write to the canonical model; it may propose a Product Change when implementation reveals a contradiction, and a human decides. Citations resolve within one repository in v0.2; cross-repository resolution is out of scope.

## Validation

Structural validation is deterministic: same repository content, same diagnostics in the same order on every platform. Diagnostics carry severity, stable code, message, file, and when applicable artifact, change, field, target, line or entry. Exit codes: 0 success (warnings allowed), 1 validation errors, 2 invalid invocation or configuration, 3 unexpected internal failure. Warnings are not errors; only `validation.warnings-as-errors` may make a command fail on them, and tools must not escalate unilaterally.

The error codes an agent most often acts on: `PRODUCT001`-`PRODUCT009` (parse, schema, type, prefix, duplicate, unknown reference, disallowed target type, retired reference, body sections), `PRODUCT020`-`PRODUCT028` (change operations and overlay), `PRODUCT042`/`PRODUCT060`-`PRODUCT067` (citations), `PRODUCT050` (configuration). Warnings worth reading as signals: `PRODUCT101` (filename alignment), `PRODUCT103` (requirement unreachable from any actor), `PRODUCT105`/`PRODUCT106`/`PRODUCT107` (unconsumed rule, unused term, context with no language), `PRODUCT108` (approved change with open questions), `PRODUCT111` (low-confidence recovered draft).

Deterministic tools check structure and references, never truth. Whether a rule is *good*, a requirement *complete*, or a term *well chosen* are human judgement calls; the tooling makes the questions answerable, not answered.
