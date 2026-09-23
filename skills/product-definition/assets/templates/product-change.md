---
id: CHG-EXAMPLE-001
type: product-change
title: Example product change
status: draft
base-revision: '3f2a91c'
operations:
  add:
    - FR-EXAMPLE-001
  modify:
    - UC-EXAMPLE-001
  remove: []
---

<!--
Product change: an explicit, validated delta against the baseline that records the meaning,
rationale, scope and affected artifacts of a proposed product modification.
Every ID under operations.add and operations.modify needs a complete proposed artifact
under proposed/, laid out exactly as it will live in the model. Set base-revision to the
baseline commit this change was created against, quoted so YAML reads an all-digit
revision as a string. Exactly '0000000' is the reserved no-baseline sentinel, only for
CHG-INITIAL with no baseline commit.
Validate the overlay before product approval. status: approved authorizes explicit apply;
apply materializes the proposal on a working branch but does not accept it. A pull-request
merge accepts the resulting baseline. Product Change status never records implementation,
verification, release or deployment.
Schema reference: https://pdac.dev/spec/frontmatter-reference/
-->

## Problem

<!-- What is wrong or missing in the current Product Definition? State the problem,
not the solution. -->

## Intended Product Outcome

<!-- What the Product Definition says once this change is accepted. Describe the
destination, not the steps. -->

## Rationale

<!-- Why this outcome, and why now. Record the reasoning a future reader would
otherwise have to reconstruct. -->

## Affected Product Areas

<!-- Which parts of the product this change touches, in product language rather
than file paths. -->

## Open Questions

<!-- Unresolved questions that need a human decision before the change can be
approved. Write "None." when there are none. -->

- Should X be Y or Z?

## Product Acceptance

<!-- How a human recognises that the accepted definition expresses the intended outcome. -->

## Out of Scope

<!-- What this change explicitly does not touch, including delivery, technical
design and implementation. -->
