# Discovery and Recovery

Discovery runs before modelling: find where product knowledge already exists, then extract it with evidence, before inventing anything. The same loop serves a greenfield product (little to find, much to ask), a brownfield system (much to find, in code and tests), and a repository that already has partial documentation.

## Sources, in order of authority

| Source | What it gives | Evidence class |
| --- | --- | --- |
| Existing product docs, specifications, PRDs | Stated intent | Explicit documented intent |
| ADRs and decision records | Decisions with rationale and rejected alternatives | Explicit documented intent |
| README, marketing pages, onboarding docs | Positioning, audience, promised outcomes | Explicit documented intent (verify against behaviour) |
| Tests, especially acceptance and integration tests | Behaviour the system actually exhibits | Observed behaviour |
| Source structure, validation code, error messages | Rules enforced by the system | Observed behaviour |
| Issue trackers, spec artifacts (when locally available) | History of intent and contested decisions | Mixed; classify per item |
| Conversations and team knowledge | Everything not yet written down | Unknown until asked; then explicit |

Read the sources in that order. Where a higher-authority source contradicts a lower one, record the contradiction; do not silently pick a winner. A contradiction between documented intent and observed behaviour is a finding, not a formatting problem.

## The discovery loop

1. **Inventory.** List the sources that exist in this repository. Note which are absent — absence is information (a product with no tests and no docs is recovered from code and questions alone).
2. **Extract.** Read each source fully. For every product-relevant claim, record: the claim, the source, and the evidence class. In PDaC, this becomes the `provenance` object on the recovered artifact (`source`, `confidence`, `recovered-from`).
3. **Classify.** Sort claims into the artifact kinds they imply: an actor, a journey, a use case, a rule, a term, a requirement, a behaviour. See the [artifact guide](artifact-guide.md) for what each kind is for.
4. **Reconcile.** Merge duplicates (same claim, several sources — keep the strongest evidence). Flag contradictions for a human decision. In PDaC, contradictions between recovered candidates are resolved in the change, before the definition is accepted, never patched into the baseline afterwards.
5. **Ask.** Collect the unknowns into questions for the humans who know. One question at a time, each naming something specific. Record answers verbatim.
6. **Record gaps.** What no source could answer stays an open question. Never fill a gap by inventing intent.

## Brownfield specifics

A shipped system without a product definition is the hardest case, and the most valuable: the behaviour is authoritative because it is what users experience.

- **Tests are the strongest evidence** of accepted behaviour: a test encodes a stimulus and an expected outcome, which is exactly what a use case failure path or a structured behaviour records. Read acceptance and integration tests first.
- **Validation code and error messages** encode business rules: a limit check, a state transition guard, an authorization branch. These are rules with high-confidence evidence.
- **Source structure** suggests bounded contexts and domain terms, but only suggests: naming drifts. Record terms with the evidence you actually have.
- **Label observed versus inferred** in the body of every recovered artifact. A reader must be able to tell what the system does from what somebody thinks it should do.

In PDaC, brownfield recovery is an input activity to `CHG-INITIAL`, not a separate lifecycle: recovered candidates are drafted as proposed artifacts with `provenance`, low-confidence drafts surface as `PRODUCT111`, and the human validation queue is the review of that change. There is no separate "recovery" artifact type.

## Greenfield specifics

With no system to recover, discovery is interviewing: the product intent exists only in people's heads. Work the [dependency chain](artifact-guide.md#authoring-order) — actors first, then journeys, then use cases — asking one question at a time, recording answers verbatim, and writing open questions down as they surface. A greenfield definition is finished when its open questions are answered or explicitly deferred, not when every section has prose.

## What discovery never does

- Never edits the system or its documentation to make evidence easier to find.
- Never promotes an inference to accepted intent without a human saying yes.
- Never discards contradicting evidence because one side was easier to read.
- Never invents a rule to make a use case's flow consistent; the inconsistency is the finding.
