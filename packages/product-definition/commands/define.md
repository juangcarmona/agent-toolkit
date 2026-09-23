---
name: define
description: Extract product knowledge from existing evidence before inventing anything, distinguishing documented intent, observed behaviour, inferred intent and unknowns. Inference never becomes accepted product truth without human approval.
argument-hint: "[product area | artifact kind | a raw idea]"
metadata:
  plugin: product-definition
  author: "juangcarmona"
---

Carry out the `product-definition` skill's **model** phase for: $ARGUMENTS

Follow the skill's discovery and artifact-guide references: extract before inventing, classify every claim's evidence (explicit documented intent, observed behaviour, inferred intent, unknown), and author the artifacts the evidence supports along the dependency chain, starting each one from the skill's bundled template for its kind. Record gaps as open questions rather than filling them.

In a PDaC repository, draft inside a Product Change (`CHG-INITIAL` for a first definition, an ordinary change otherwise) with `provenance` on recovered artifacts, and validate the overlay. In general mode, propose the files as diffs for human approval. Never mark anything accepted on your own authority.
