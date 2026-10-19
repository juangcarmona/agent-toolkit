---
name: adr
description: "Draft and maintain Architecture Decision Records from maintainer-supplied decisions and repository evidence. Use when a durable architectural trade-off needs a reviewable record."
license: MIT
metadata:
  author: juangcarmona
  source: https://github.com/juangcarmona/agent-toolkit
---

# adr

## Purpose

One responsibility: record one significant decision as an Architecture Decision Record, so the _why_ and the road not taken survive the people who were in the room.

The template is the single source of the document's shape. Copy it; never hand-roll the sections.

## When to use

- When `propose` reaches a decision with lasting trade-offs.
- When `review` finds that a lesson has graduated into an architectural decision worth recording.
- Standalone, when a decision shapes the architecture, a dependency, a cross-cutting pattern, or anything hard to reverse: anything a future contributor would want the reasoning for.

## When not to use

- A routine implementation choice with no lasting trade-off. It belongs in the commit narrative.
- A temporary decision relevant only to delivering the current change. Keep it in the plan.
- Reversing an existing decision by rewriting it. Write a new record and mark the old one superseded.

Create an ADR when a decision is architecturally significant or has durable trade-offs that future contributors will need to understand. If the choice is local, easily reversible, or adequately explained by code and normal change history, do not create an ADR.

A plan explains how a particular change will be delivered; an ADR preserves a durable architectural decision and its rejected alternatives. Create an ADR for lasting architectural consequences even when the decision first appeared in a plan. Link the ADR and plan or change instead of copying the plan narrative into the ADR.

## Workflow

When an accepted ADR is indexed in arc42 section 09, preserve this table structure:

```markdown
| Decision | ADR | Affected architecture |
| --- | --- | --- |
```

1. **Confirm decision authority.** Identify the maintainer or role authorized to decide. The decision must come from that authority; repository evidence can reveal current behavior and constraints but cannot establish intent or acceptance. If the decision is unknown, ask for it rather than inferring a choice from code, plans, or an issue. Keep new records `Proposed` unless the maintainer explicitly says the decision is accepted.
2. **Inspect the repository convention.** Read the existing ADR collection, its index, relevant accepted ADRs, and architecture decision index when present. Reuse the canonical location, filename, metadata, status vocabulary, and index. Never create a parallel collection. If no convention exists, use `docs/adr/`, create its `README.md` index, and follow the default format in [`references/template.md`](references/template.md).
3. **Name and number the record.** Use a short present-tense decision title. Follow the repository's established identifier and filename pattern. For the default format, take the highest existing `ADR-NNNN` identifier and increment it; numbers only increase and are never reused, including retired numbers. Use `ADR-NNNN-kebab-case-title.md` for the default filename. If the repository's existing pattern is ambiguous, preserve it and surface the ambiguity for review instead of starting a second scheme.
4. **Copy the template and complete it.** Fill Context with neutral, evidence-backed facts, constraints, assumptions, and the reason a decision is needed. State the supplied choice actively in Decision. List the main rejected alternatives and why each was rejected. Describe positive, negative, and neutral consequences. Add references. Separate observed facts, maintainer-supplied intent, and unresolved assumptions; do not present an inference as a decision. Remove every placeholder.
5. **Preserve history.** Reverse a decision by proposing a new ADR, not by rewriting the old rationale. Do not mark an existing ADR superseded until the replacement decision is accepted. Confirm a superseding relationship with the maintainer before recording it.
6. **Update the canonical ADR index.** Add a row for each record using the repository's existing index shape. If the default `README.md` index is used, link the ID/title and show status and date in numeric order. Keep the index navigational; rationale and consequences belong in the ADR. If an established repository has no index, report that and ask before creating one rather than silently inventing a convention.
7. **Update arc42 section 09 when applicable.** Only an `Accepted` ADR belongs in `docs/architecture/09-architecture-decisions.md`. Add or update a row with `Decision`, `ADR`, and `Affected architecture`, identifying relevant arc42 sections or areas. Keep status, context, rationale, alternatives, consequences, and history in the ADR. A superseded decision's entry must point to the record representing the current architecture. Do not change other arc42 sections here; architecture maintenance documents the resulting system shape.
8. **Present the record for review.** Show the complete diff, identify evidence and assumptions, report the path and identifier, and surface open questions. Leave acceptance of a proposed decision and acceptance of the documentation to the maintainer.

### Status vocabulary

Drawn from a fixed set. Never invent a value.

| Status                   | Meaning                                        |
| ------------------------ | ---------------------------------------------- |
| `Proposed`               | Under discussion; the default for a new record |
| `Accepted`               | Agreed and in effect                           |
| `Rejected`               | Considered and declined, kept for the record   |
| `Deprecated`             | No longer applies, and not replaced            |
| `Superseded by ADR-NNNN` | Replaced by an accepted decision; link it      |

Records are immutable in spirit. To reverse a decision, write a new record and mark the old one superseded, never rewrite history. The date records when the status last changed.

## Validation

- The filename and identifier follow the repository convention; under the default format the filename is `ADR-NNNN-kebab-case-title.md` with a unique, sequential four-digit `ADR-NNNN` identifier.
- The document starts with YAML frontmatter containing the fields in the repository's convention; under the default format it has `id`, `title`, `status`, `date`, and `deciders`, with `supersedes` or `superseded_by` only for a confirmed relationship.
- The document has its heading, valid frontmatter, and all five sections in order, with no leftover placeholders.
- The status is a valid value from the vocabulary and the date is `YYYY-MM-DD`.
- The decision and its acceptance state are supplied by an authorized maintainer, never inferred from implementation evidence.
- Alternatives considered names at least the main rejected option, with a reason: this is what separates a decision record from a commit message.
- The canonical ADR index has a matching entry, or the established absence of an index is reported without creating a competing convention.
- When section 09 exists, it indexes accepted architectural decisions using only `Decision`, `ADR`, and `Affected architecture`; proposed decisions are absent, and an entry for a superseded decision points to the ADR representing the current architecture.

## Common pitfalls

| Pitfall | Fix |
| --- | --- |
| Hand-rolling the sections | Copy `references/template.md`. It is the single source of the document's shape |
| Reusing a number, including a retired one | Numbers only ever increase |
| Inventing a status value | Use the fixed vocabulary, `Superseded by ADR-NNNN` included |
| Rewriting an existing record to reverse it | Propose a new record; mark the old one superseded only after the replacement is accepted |
| Inferring a decision from implementation | Ask the authorized maintainer for the decision; evidence establishes behavior, not intent |
| Creating a parallel ADR collection | Reuse the repository's canonical folder and index |
| Silently adding a convention to an established collection with no index | Report the gap and ask before changing the convention |
| Titling the record with a topic | The title names the decision, in present tense |
| Leaving Alternatives considered empty | Without the rejected option and its reason, this is a commit message |
| Leaving template placeholder text in place | Every section is filled before the file is written |
| Recording a routine implementation choice | Use an ADR only for significant decisions or durable trade-offs |
| Treating a plan as the ADR | Keep delivery detail in the plan; link a durable ADR without copying it |
| Adding a proposed ADR to arc42 section 09 | Index it only after acceptance |
| Copying ADR details into arc42 section 09 | Keep section 09 to decision, ADR link and affected architecture |
| Treating an inferred or proposed choice as accepted | Keep it Proposed until the maintainer explicitly accepts it |
