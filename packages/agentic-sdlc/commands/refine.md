---
name: refine
description: Take a raw idea or an existing work item to the project's Definition of Ready. Lifecycle stage 1; ends at the Ready gate.
argument-hint: "[work-item-id | a raw idea]"
metadata:
  plugin: agentic-sdlc
  author: "juangcarmona"
---

Carry out the `refine` skill for: $ARGUMENTS

If no work item identifier and no idea was given, ask for one before starting.

Follow the skill exactly, including its confirmation points and its guardrails. Stop at the Ready gate: report the verdict, name `propose` as what follows, and do not run it.
