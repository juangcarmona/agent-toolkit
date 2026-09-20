---
name: status
description: Report where a work item sits in the lifecycle, what comes next, and what has drifted. Read-only.
argument-hint: "[work-item-id]"
metadata:
  plugin: agentic-sdlc
  author: "juangcarmona"
---

Carry out the `status` skill for: $ARGUMENTS

If no work item identifier was given, infer it from the current branch, and only ask if that fails.

It is read-only: change nothing, no transition, no comment, no branch, no push. Name the next capability explicitly, and do not invoke it.

Where the raw tracker, branch, pull request and CI output would only pollute this session, delegate to the `flow-reporter` agent instead and report what it returns.
