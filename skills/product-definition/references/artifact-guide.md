# Artifact Guide

How to select, author and connect product-knowledge artifacts. The kinds below follow the PDaC reference profile; in general mode they are guidance (adapt freely), in PDaC mode they are the normative vocabulary (the [specification](https://pdac.dev/spec/artifacts/) defines the contracts; this guide operationalizes them without replacing them).

## Choosing kinds

| Question you are answering | Kind |
| --- | --- |
| Who or what interacts with the product? | Actor |
| What end-to-end outcome is pursued? | Journey |
| What concrete interaction produces an outcome? | Use Case |
| What durable knowledge governs behaviour? | Business Rule |
| What does this word mean here? | Domain Term |
| Where does this vocabulary carry its meaning? | Bounded Context |
| What must the product do? | Functional Requirement |
| What quality must it exhibit, measurably? | Quality Requirement |
| What boundary is imposed on it? | Constraint |
| What is one concrete accepted example of behaviour? | Structured Behaviour |

Selection errors to avoid: a rule hidden inside a use case's flow (it cannot be reused or cited); a requirement that is really an implementation task; a term defined in prose where a glossary entry belongs; a persona where an actor belongs (actors are not demographics).

## Authoring order

Author along the dependency chain, because most kinds reference earlier ones:

```text
Actors → Journeys → Use Cases → Business Rules
                       ↘ Domain Terms ← Bounded Contexts
Requirements (FR/QR) derive from Use Cases, Business Rules, Constraints
Structured Behaviours illustrate Use Cases, Business Rules, Constraints
```

This is a completeness checklist, not a gate sequence: draft what the evidence supports, in any order, and let validation name what is missing.

## Per-kind guidance

### Actor

Who or what interacts with the product to achieve a meaningful outcome. Kinds: human, external system, scheduled process, the product itself. Actors are **not personas**: no demographics, no fictional details. An actor entry states its purpose, goals, responsibilities and boundaries.

PDaC: `ACT-` prefix; frontmatter `actor-kind` required; body sections Purpose, Goals, Responsibilities, Boundaries. Template: [actor.md](../assets/templates/actor.md).

### Journey

An end-to-end outcome pursued by an actor, crossing use cases, channels, contexts, waiting periods and failure paths. The journey narrative is the user's story of getting something done; it is not screen-by-screen UI behaviour unless the UI sequence is materially part of the product behaviour. Branches and exceptional paths belong in the body; the ordered main path is the structured part.

PDaC: `JRN-` prefix; `primary-actor` and ordered `steps` (use-case references) required; body sections Intended Outcome, Entry Conditions, Journey Narrative, Variants and Branches, Completion Conditions. A use case may appear in zero, one or many journeys; absence from a journey is not a defect. Template: [journey.md](../assets/templates/journey.md).

### Use Case

A concrete interaction through which an actor obtains a product outcome. The body describes observable behaviour: goal, trigger, preconditions, main flow, alternative flows, failure conditions, postconditions. Implementation design does not belong here.

PDaC: `UC-` prefix; `primary-actor` required; optional `supporting-actors`, `bounded-context`, `governed-by` (rules), `uses-terms`. Template: [use-case.md](../assets/templates/use-case.md).

### Business Rule

Durable product knowledge that governs behaviour. The test of a rule: it applies to multiple use cases or requirements, so it must be independently identifiable and reusable rather than hidden inside stories, acceptance criteria, UI validation, code, database constraints or tests. One clear normative statement, with rationale, examples and exceptions.

PDaC: `BR-` prefix; optional `applies-to` (journeys, use cases or bounded contexts), `uses-terms`. When a concrete testable example is authored as a Structured Behaviour, that artifact is the canonical carrier of its clauses; the rule body must not present a second canonical restatement (it may mention the SB ID or carry a citing projection). Template: [business-rule.md](../assets/templates/business-rule.md).

### Domain Term

Shared meaning. A term's definition must add something beyond its title; "Distinguish From" is where neighbouring terms are separated. Terms are defined **within** a bounded context; the same word may mean different things in different contexts.

PDaC: `TERM-` prefix; `defined-in` (bounded context) required — ownership is authored on the term, never on the context (`owns-terms` is derived and must not be authored); optional `synonyms`, `uses-terms`. Template: [domain-term.md](../assets/templates/domain-term.md).

### Bounded Context

A product-language boundary: where a set of terms carries a specific meaning. Contexts do not imply modules, aggregates or source structure in PDaC v0.2 — they are language boundaries, nothing more.

PDaC: `BC-` prefix; body sections Responsibility, Language, Boundaries, External Relationships. Template: [bounded-context.md](../assets/templates/bounded-context.md).

### Functional Requirement

A derived product obligation stating what the product must do. "Derived" is load-bearing: every FR traces to the use cases, business rules or constraints it comes from (`derived-from`), which is what keeps requirements from being invented wishes. The requirement statement uses explicit normative language; a requirement must not be a disguised implementation task.

PDaC: `FR-` prefix; `derived-from` (non-empty) and `verification` (non-empty) required. Each verification entry is exactly one of: an inline `scenario` (optionally with a stable `id` for citation anchoring) or a `scenario-ref` naming a Structured Behaviour. The body should not restate verification criteria; a body section that reproduces them is a projection that must follow the embedding rules. Template: [functional-requirement.md](../assets/templates/functional-requirement.md).

### Quality Requirement

A measurable quality obligation. The difference between a quality requirement and a wish is the measurement: "the system should be fast" satisfies no contract. State the quality attribute, what it applies to, and how conformance is measured.

PDaC: `QR-` prefix; `quality-attribute`, `applies-to` (non-empty) and `verification` required, same inline-or-reference union as FR. Template: [quality-requirement.md](../assets/templates/quality-requirement.md).

### Constraint

An externally imposed or deliberately fixed boundary: regulatory, contractual, technical, self-imposed. When `applies-to` is absent, the constraint applies to the entire product. Constraints are the one place externally visible implementation reality may be named, because it is imposed.

PDaC: `CON-` prefix; optional `applies-to`, `uses-terms`. Template: [constraint.md](../assets/templates/constraint.md).

### Structured Behaviour

One concrete, implementation-independent example of accepted observable product behaviour: separated context, single stimulus, observable outcomes. Use it when an example needs independent identity, reuse, lifecycle or citation; keep verification inline in the requirement when it does not.

PDaC: `SB-` prefix; `illustrates` (use cases, business rules or constraints; non-empty), `when`, `then` required, `given` optional; body sections Intent, Boundaries. Entries are conjunctive — alternative contexts or outcomes are separate SB artifacts, never an "or" clause. Values must not begin with the words GIVEN, WHEN, THEN or AND (renderers may add them). An SB must not name test classes, selectors, mocks or internal messages; an externally visible API operation, event or document may be named when it is part of the product contract. Template: [structured-behaviour.md](../assets/templates/structured-behaviour.md).

## Connecting artifacts

- **Traceability is authored, impact is derived.** A requirement names what it derives from. What depends on a rule is computed from those authored edges, never maintained by hand.
- **One fact, one home.** State a rule once; reference it everywhere else. In PDaC, consumer documents cite rather than restate.
- **Relationships have canonical direction.** See the [PDaC contracts](pdac-contracts.md) reference for the full vocabulary; never author a reverse relationship (for example, never write `owns-terms` on a bounded context).
- **Status discipline.** In PDaC, `active` artifacts must not reference `retired` ones; `draft` may reference `draft`. Deprecation is visible, retirement keeps history.
