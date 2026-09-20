---
name: status
description: Read-only overview of product-definition health, scope, gaps, detected drift and relevant active changes. Does not manufacture quality scores.
metadata:
  plugin: product-definition
  author: "juangcarmona"
---

Carry out the `product-definition` skill's **maintain** phase in read-only mode for this repository.

Report: which mode the repository is in (general or PDaC-aware, and how that was detected); the definition's scope (artifact counts by kind, or document inventory in general mode); structural health (validator output in PDaC, hand-checked invariants otherwise); detected drift (stale citations, contradictions between definition and consumers); active Product Changes with their status and open questions, in PDaC repositories; and the gaps — open questions, low-confidence recovered knowledge, unreachable requirements.

Read-only: change nothing, fix nothing, score nothing. Name what a human should look at next.
