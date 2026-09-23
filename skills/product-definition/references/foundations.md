# Product-Definition Foundations

## Why explicit product knowledge

Product intent that lives only in tickets, code, conversations and agent context is reconstructed on every use, and it drifts silently from what was decided. Explicit product knowledge in Markdown makes intent durable, navigable and usable by both humans and agents: an agent answering "what does the product do about refunds" reads one canonical rule instead of guessing from a changelog.

The test of a product definition is not completeness but usefulness: can a newcomer, a maintainer or an agent answer a product question from the definition alone, with confidence about where the answer came from?

## What product knowledge is (and is not)

Product documentation describes **product behaviour and obligations**: what the product does, for whom, under which rules, and what it must achieve. It does not describe implementation design — class names, algorithms, frameworks, storage choices — unless naming an externally imposed, externally visible constraint is unavoidable.

This boundary is a review question as much as an authoring rule. When a statement names implementation machinery, either the statement belongs in technical design documentation, or the machinery is itself part of the product contract (an externally visible API operation, event or document) and should be named as such.

## The evidence ladder

Every claim in a product definition comes from somewhere. Classify the evidence before writing it down:

| Class | Meaning | How to record |
| --- | --- | --- |
| Explicit documented intent | A specification, decision record or requirement document states it | Cite the source; record with high confidence |
| Observed behaviour | The shipped system behaves this way (tests, code paths, live observation) | Record as observed; in PDaC, carry `provenance` with the evidence source |
| Inferred intent | Nobody wrote it down, but the behaviour across several sources implies it | Record as inferred with the reasoning; in PDaC, `provenance.confidence: medium` or `low` |
| Unknown | No evidence either way | Record as an open question; never fill it by inventing |

The strong rule: **inference never becomes accepted product truth without human approval.** A recovered definition full of inferred claims is a queue of candidates for validation, not a finished baseline. In PDaC this is mechanical: draft artifacts with `provenance.confidence: low` surface as `PRODUCT111` warnings, so the validation queue is derivable from tooling output.

## The general-mode structure

A repository that does not adopt PDaC still benefits from explicit product knowledge. The smallest coherent structure, adaptable to the repository's size:

```text
docs/product/
├── README.md            navigation: what lives where, reading order
├── actors.md            who interacts with the product and what they seek
├── journeys.md          end-to-end outcomes, in the user's words
├── use-cases.md         concrete interactions per outcome
├── rules.md             durable business rules, one per heading
├── glossary.md          shared vocabulary, one term per heading
└── requirements.md      obligations: functional and quality
```

Adapt freely: a small product may merge files; a large one may split by domain. What makes it a product definition rather than scattered notes:

- **Addressable units.** Every rule, term and use case has a stable heading or anchor others can point at. Stable identifiers are valuable generally — they survive file reorganization — but the PDaC identifier grammar (`BR-`-style prefixes, uppercase segments) is only enforced when PDaC semantics are claimed.
- **Traceability.** A requirement names the use case, rule or constraint it derives from, in prose or a list. Untraceable requirements are guesses wearing suits.
- **One fact, one home.** A rule lives in exactly one place; other documents link to it. Duplication is where drift begins.
- **Open questions are visible.** What is not yet decided is written down as a question, not papered over with confident prose.

## From general to PDaC

When a repository outgrows the general structure — the graph of relationships matters, consumers need machine-verifiable citations, semantic evolution needs governance — adopting PDaC is a migration, not a rewrite: the knowledge already captured is the input to `CHG-INITIAL`, the single initialisation change through which the first PDaC baseline is accepted. The artifact kinds, identifiers and relationships of the reference profile are defined by the [PDaC specification](https://pdac.dev/spec/artifacts/), not by this skill; see the [PDaC contracts](pdac-contracts.md) reference for the operational summary.

The distinction between the modes is deliberate and must not blur in either direction:

- A general repository MAY keep lighter structures. Recommending the full PDaC reference profile to a two-file product definition is over-engineering, not rigor.
- A PDaC repository MUST satisfy the normative contracts where it claims them. "PDaC-lite" rules that contradict the specification are non-conforming, not a middle ground.
