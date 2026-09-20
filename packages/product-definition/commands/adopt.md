---
name: adopt
description: Inspect the repository, find where product knowledge lives, and recommend or establish the smallest coherent product-definition structure. Never imposes the full PDaC reference profile.
metadata:
  plugin: product-definition
  author: "juangcarmona"
---

Carry out the `product-definition` skill's **discover** phase for this repository: $ARGUMENTS

Follow the skill's discovery reference: inventory the sources (README, existing product docs, requirements, architecture docs, ADRs, tests, source structure, issue artifacts when locally available), extract what exists with its evidence class, and reconcile.

Then recommend the smallest coherent product-definition structure for what was found — from the general-mode layout to, when the repository's needs justify it, adopting PDaC through `CHG-INITIAL`. Present the recommendation before writing anything. Do not automatically install the complete PDaC reference profile.
