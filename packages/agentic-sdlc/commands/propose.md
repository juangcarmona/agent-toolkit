---
name: propose
description: Turn a ready work item into a reviewable solution design and raise it as a draft pull request. Lifecycle stage 2; ends at the Planned gate.
argument-hint: "[work-item-id]"
metadata:
  plugin: agentic-sdlc
  author: "juangcarmona"
---

Carry out the `propose` skill for: $ARGUMENTS

A work item identifier is required. If none was given, ask for one before starting.

Follow the skill exactly, including its confirmation points and its guardrails. The pull request is opened as a draft on purpose: that state is the gate. Stop at the Planned gate, name `implement` as what follows, and do not run it.
