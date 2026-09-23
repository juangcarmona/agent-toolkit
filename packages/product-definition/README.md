# `product-definition`

Product definition as a capability: discover, model, connect, review and maintain explicit product knowledge in Markdown, from a lightweight structure to full [Product Definition as Code](https://pdac.dev/spec/) (PDaC).

It works at two layers deliberately. **General product definition** helps any repository keep durable, navigable product knowledge without adopting PDaC. **PDaC-aware product definition** respects the actual PDaC model and workflow — canonical artifacts under `docs/product/model/`, typed relationships, stable identifiers, citations and Product Changes — without inventing "PDaC-lite" rules that contradict the specification.

## What is where

| Piece | Location | Job |
| --- | --- | --- |
| The skill | [`skills/product-definition`](../../skills/product-definition) in the root collection | The canonical knowledge: discovery, artifact guidance, PDaC contracts, changes and citations, review, CLI reference |
| The agent | [`agents/product-engineer.agent.md`](agents/product-engineer.agent.md) | Advisory product-value and simplification analysis over the definition; never modifies it |
| The commands | [`commands/`](commands/) | Thin entry points that dispatch to the skill's phases |

The skill is shared with the root collection through the package's [`apm.yml`](apm.yml) git dependency rather than duplicated here: one canonical copy, projected to consumers by APM.

## Commands

All namespaced under the plugin, so `/product-definition:refine JRN-CHECKOUT`.

| Command | What it does |
| --- | --- |
| `adopt` | Inspect the repository, find where product knowledge lives, recommend the smallest coherent structure |
| `define` | Extract product knowledge from evidence before inventing; inference never becomes truth without approval |
| `refine` | Improve a slice: contradiction, duplication, terminology drift, missing rules, complexity |
| `review` | Assess quality without modifying: deterministic conformance distinguished from human judgement |
| `status` | Read-only health, scope, gaps, drift and active changes |

## The Product Engineer agent

`product-engineer` is not a PDaC administrator. It combines graph-aware product-definition analysis with product-value analysis: user outcomes, step counts, unnecessary decisions, duplicated entry, dead ends, forced sequencing, edge-case tax, vocabulary burden, missing fast paths. It surfs the product graph one ring beyond the slice before recommending any removal, builds an explicit ranked cut list grounded in artifact IDs, names the product essence, and reports value density.

It is strictly advisory. It never modifies the accepted definition; in a PDaC repository, its recommendations that would alter product semantics are framed as Product Change candidates. It reasons from canonical Markdown when ProductShape is unavailable, and says so.

## Relationship to the workflow

The commands drive the skill's loop (discover → model → connect → review → maintain). The agent is a specialist invoked when the question is product value rather than product structure — "should this journey be simpler" rather than "is this definition conformant". They share the same canonical knowledge and never duplicate it.

## Ownership

The capability is maintained in the [agent-toolkit](https://github.com/juangcarmona/agent-toolkit) repository. The PDaC specification is authoritative where PDaC semantics are claimed; this package distills it operationally and links to the normative source.
