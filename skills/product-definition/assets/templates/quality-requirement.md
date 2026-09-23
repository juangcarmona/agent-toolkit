---
id: QR-EXAMPLE-001
type: quality-requirement
title: Example Quality Requirement
status: draft
quality-attribute: portability
applies-to:
  - UC-EXAMPLE-001
verification:
  - scenario: A measurable scenario demonstrating the quality level is met
uses-terms: []
---

<!--
Quality requirement: a measurable quality obligation. "The system should be fast" does not
satisfy this contract - Measurement must state how conformance is measured.
quality-attribute: e.g. portability, determinism, explainability, extensibility.
applies-to: journeys, use cases or bounded contexts (required, non-empty).
verification: same inline-or-reference union as a functional requirement.
uses-terms (optional): TERM ids whose definitions understanding this requirement requires.
provenance (optional): the evidence behind recovered knowledge. Set it on recovered
(brownfield) artifacts; leave it unset when authoring from intent. It records evidence,
never authorship: git history remains the record of who changed what and when.
provenance:
  source: path/to/evidence.ts      # required; may also be a URL, a ticket, or an interview
  confidence: high | medium | low  # required; how strongly the evidence supports the claim
  recovered-from: observation | inference | interview | documentation  # optional
A draft whose confidence is low is reported as PRODUCT111, so candidates needing human
validation are derivable from validation output.
Contract: https://pdac.dev/spec/artifacts/
Schema reference: https://pdac.dev/spec/frontmatter-reference/
-->

## Requirement

<!-- The quality obligation, in explicit normative language. -->

## Measurement

<!-- How conformance is measured: the metric, the method, the threshold. -->
