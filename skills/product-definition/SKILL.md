---
name: product-definition
description: Discover, model, connect, review and maintain explicit product knowledge in Markdown, from a lightweight product-definition structure to full Product Definition as Code (PDaC) with actors, journeys, use cases, business rules, domain terms, requirements, citations and Product Changes. Use when creating or improving product documentation, recovering product intent from an existing system, reviewing product-definition quality, or working in a repository that has adopted PDaC.
license: MIT
compatibility: PDaC-aware work benefits from the prodshape CLI (Node.js 22+, @prodshape/cli); the skill reasons from canonical Markdown when no tooling is installed.
metadata:
  author: juangcarmona
  source: https://github.com/juangcarmona/agent-toolkit
---

# product-definition

## Purpose

Make product intent durable, navigable and usable by humans and agents, instead of repeatedly reconstructing it from tickets, code, conversations and agent context. Product documentation describes product behaviour and obligations; it does not leak implementation design unless naming an externally imposed, externally visible constraint.

## Two modes

Detect the mode before doing anything else:

- **General product definition.** The repository keeps explicit product knowledge in Markdown without claiming PDaC conformance. It may use simpler structures, fewer artifact kinds and lighter conventions. Nothing in the PDaC specification is imposed on it.
- **PDaC-aware product definition.** The repository has adopted Product Definition as Code: canonical artifacts under `docs/product/model/**/*.md`, typed relationships, stable identifiers, citations and Product Changes under `docs/product/changes/`. Detect it by `.product/config.yaml` or a populated `docs/product/model/`. In this mode the [PDaC specification](https://pdac.dev/spec/) is authoritative where PDaC semantics are claimed, and its normative contracts are not simplified, extended or contradicted.

The distinction is explicit everywhere: a general repository MAY choose simpler Markdown structures; a PDaC-conforming repository MUST follow the normative contracts. Stable identifiers are valuable generally, but the PDaC identifier grammar is enforced only when PDaC semantics are claimed.

## The loop

1. **Discover.** Find where product knowledge already exists before inventing anything. See [discovery](references/discovery.md).
2. **Model.** Turn evidence into explicit product knowledge: actors, journeys, use cases, business rules, terms, requirements, behaviours. See the [artifact guide](references/artifact-guide.md).
3. **Connect.** Link the knowledge so it is navigable: typed relationships, traceability from requirements to the knowledge they derive from. In PDaC, follow the canonical relationship vocabulary; never invent reverse relationships. See [PDaC contracts](references/pdac-contracts.md).
4. **Review.** Assess quality without modifying: structural conformance where a contract exists, semantic quality always. See [product review](references/product-review.md).
5. **Maintain.** Keep the definition current. In PDaC, semantic evolution happens only through Product Changes; in general mode, through reviewed edits. See [PDaC changes](references/pdac-changes.md).

## Operating principles

- **Extract before inventing.** Distinguish explicit documented intent, observed behaviour, inferred intent and unknowns. Never turn inference into accepted product truth without human approval.
- **Human approval is authoritative for product intent.** Deterministic tooling validates structure and consistency, never whether a product decision is good.
- **Propose, never impose.** When a repository has not adopted a structure, recommend the smallest coherent one; do not automatically install the complete PDaC reference profile.
- **Tools own structure, agents own semantics.** When the prodshape CLI is present, structural facts come from its commands, never from re-deriving them by reading state. See the [ProductShape CLI reference](references/productshape-cli.md).
- **Canonical over generated.** Authored Markdown is the source of truth; graphs, indexes and reports are derived and reproducible.

## Boundaries

- Never silently modify an accepted product definition. In PDaC, recommendations that alter product semantics become explicit Product Changes; in general mode, proposed diffs a human approves.
- Never invent product intent to fill a gap; record the gap as an open question instead.
- Never restate what can be cited. In PDaC, consumer documents cite canonical text by ID and digest rather than paraphrasing it.
- Do not turn optional product-documentation practices into PDaC requirements, and do not loosen normative PDaC rules when PDaC conformance is claimed.

## Foundations

The principles behind durable product knowledge, evidence classification and the general-mode structure are in [foundations](references/foundations.md). The full capability map:

| Concern | Reference |
| --- | --- |
| Principles, evidence classes, general-mode structure | [foundations](references/foundations.md) |
| Discovery and recovery from existing systems | [discovery](references/discovery.md) |
| Artifact selection and per-type guidance | [artifact guide](references/artifact-guide.md) |
| PDaC identifiers, relationships, frontmatter, lifecycle | [PDaC contracts](references/pdac-contracts.md) |
| Product Changes, citations, validation, conformance | [PDaC changes and citations](references/pdac-changes.md) |
| Review and maintenance | [product review](references/product-review.md) |
| Verified prodshape CLI commands | [ProductShape CLI](references/productshape-cli.md) |

## Templates

Every PDaC artifact kind has a ready-to-copy authoring template under [assets/templates/](assets/templates/): the frontmatter contract, inline guidance for each field, and the body-section scaffolding with placeholder comments. Copy the template for the kind you are authoring, replace the example ID and values, and remove the guidance comment block when the artifact is complete. In a repository initialized by ProductShape, prefer the CLI's own templates (`prodshape template <kind>`, or `.product/templates/` after `init`) — they are version-matched to the installed CLI; these bundled templates are the fallback when the CLI is absent.

| Kind | Template |
| --- | --- |
| Actor | [actor.md](assets/templates/actor.md) |
| Journey | [journey.md](assets/templates/journey.md) |
| Use Case | [use-case.md](assets/templates/use-case.md) |
| Business Rule | [business-rule.md](assets/templates/business-rule.md) |
| Domain Term | [domain-term.md](assets/templates/domain-term.md) |
| Bounded Context | [bounded-context.md](assets/templates/bounded-context.md) |
| Functional Requirement | [functional-requirement.md](assets/templates/functional-requirement.md) |
| Quality Requirement | [quality-requirement.md](assets/templates/quality-requirement.md) |
| Constraint | [constraint.md](assets/templates/constraint.md) |
| Structured Behaviour | [structured-behaviour.md](assets/templates/structured-behaviour.md) |
| Product Change | [product-change.md](assets/templates/product-change.md) |
