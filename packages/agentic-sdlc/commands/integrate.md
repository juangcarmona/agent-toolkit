---
name: integrate
description: Land an approved change: enforce the Done gate, fold in the specifications, archive the plan, merge, and close the loop. Lifecycle stage 4.
argument-hint: "[work-item-id]"
metadata:
  plugin: agentic-sdlc
  author: "juangcarmona"
---

Carry out the `integrate` skill for: $ARGUMENTS

A work item identifier is required. If none was given, ask for one before starting.

Follow the skill exactly, including its confirmation points and its guardrails. **The Done gate is a hard precondition for the merge**, re-audited here rather than carried over. Offer the review at the end; do not run it.
