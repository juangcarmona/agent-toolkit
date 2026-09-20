---
name: adopt
description: Bootstrap or reconcile this project's development lifecycle configuration. Detects which mode applies from the repository.
metadata:
  plugin: agentic-sdlc
  author: "juangcarmona"
---

Carry out the `adopt` skill for this repository.

No input is required. The skill detects its own mode: **bootstrap** when `docs/engineering-lifecycle.md` is absent, **reconcile** when it is present.

Follow the skill exactly, including its confirmation points and its guardrails. Every file write is shown and confirmed first, and nothing in an established configuration changes without a diff.

End by naming the next capability. Do not run it.
