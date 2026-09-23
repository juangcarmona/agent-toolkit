# Product Review

Assessing product-definition quality without modifying it. Review has two levels, and conflating them is the classic failure: structural conformance is deterministic, semantic quality is judgement.

## Level 1: structural (deterministic, where a contract exists)

In a PDaC repository, run the tooling first and record its output verbatim as the authoritative structural baseline — never re-derive by reading files what a command already reports:

```text
prodshape validate --format json
```

Every diagnostic is a finding: errors are conformance failures to fix; warnings are signals to read (an unconsumed rule, an unreachable requirement, a low-confidence recovered draft). In a general-mode repository there is no validator; check the structural invariants by hand: addressable units, traceability links resolve, one fact one home, open questions visible.

## Level 2: semantic (judgement, always)

Reason over the definition as a product person, not a linter. The finding classes:

| Class | Question |
| --- | --- |
| Orphaned knowledge | An actor with no journey, a rule nothing references, a term nobody uses — knowledge the graph says is disconnected |
| Contradictory rules | Two rules that cannot both hold; a use case flow that violates a governing rule |
| Ambiguous terminology | One word, two meanings; two words, one meaning; a term whose definition repeats its title |
| Duplicate requirements | Two requirements obligating the same thing through different derivation paths |
| Implementation-shaped requirements | A requirement naming classes, endpoints or algorithms — product obligation in delivery clothing |
| Missing failure behaviour | Use cases with happy paths only; no structured behaviour for the rules that matter |
| Weak traceability | Requirements whose `derived-from` is decorative — the source does not actually support the obligation |
| Unvalidated recovered knowledge | Inferred intent presented as accepted; low-confidence drafts nobody has confirmed |

Classify every finding as exactly one of:

- **ERROR** — a contract violation (level 1 already caught it; fix through the normal change path).
- **OBSERVATION** — a quality concern needing no product decision (wording, structure, navigation).
- **QUESTION** — needs a human product decision (contradictions, missing intent, anything where the team must choose).

The tie-breaker: *can the team act without a product decision?* If yes, it is an observation; if acting requires deciding what the product should do, it is a question.

## Report shape

A review report separates machine-derived facts from interpretation:

1. **Structural baseline** — the validator output (or the hand-checked invariants), verbatim.
2. **Findings** — each with its class, the artifact or location, the evidence, and the classification.
3. **Graph-derived context** — for findings about disconnection or duplication, the `prodshape impact` neighbourhood that shows the structure.
4. **Suggested next steps** — fixes go through the normal change path (Product Changes in PDaC, reviewed edits in general mode); questions go to the humans who own the decision.

## What review never does

- Never fixes anything it found. Review is read-only; remediation is a separate, approved act.
- Never invents intent to resolve a contradiction. The contradiction is the finding; the resolution is a human decision.
- Never scores the definition. A fabricated quality number is worse than none: it implies a scale nobody agreed on. Report findings and their classes, not a grade.
- Never presents a semantic judgement as a conformance failure, or a conformance failure as a matter of taste.

## Maintenance

Between reviews, the definition stays current through the same discipline: every semantic change is deliberate (a Product Change in PDaC, a reviewed edit in general mode), every recovered claim eventually validated or retired, and the open-questions list kept honest — a question silently answered in someone's head is drift waiting to happen. When implementation reveals a contradiction with the definition, the consumer proposes a Product Change; it does not edit the model to match the code.
