---
name: implement
description: Apply the approved plan on its branch, verify it against the Definition of Done, and mark the pull request ready for review. Lifecycle stage 3; ends at the Done gate.
argument-hint: "[work-item-id]"
metadata:
  plugin: agentic-sdlc
  author: "juangcarmona"
---

Carry out the `implement` skill for: $ARGUMENTS

A work item identifier is required. If none was given, ask for one before starting.

Follow the skill exactly, including its confirmation points and its guardrails. The Done gate's independent audit is delegated to the `done-gate-auditor` agent; run the deterministic checks in this session and let the agent reconcile the plan against the diff. Stop at the Done gate, name `integrate` as what follows, and do not run it.
