---
name: review
description: Learn from a completed cycle: record what happened with measured effort, and propose amendments to the process itself. Lifecycle stage 5; post-merge, gates nothing.
argument-hint: "[work-item-id]"
metadata:
  plugin: agentic-sdlc
  author: "juangcarmona"
---

Carry out the `review` skill for: $ARGUMENTS

If no work item identifier was given, offer the merged items that have no review entry and let the human pick one.

Follow the skill exactly. Lead with a draft rather than asking how it went. Every amendment to the lifecycle configuration is shown as a diff and confirmed by a human before it is written.
