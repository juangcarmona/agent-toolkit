---
name: review
description: Assess product-definition quality without modifying it: structural conformance where a contract exists, semantic product quality always, with deterministic checks distinguished from human judgement.
argument-hint: "[product area | all]"
metadata:
  plugin: product-definition
  author: "juangcarmona"
---

Carry out the `product-definition` skill's **review** phase over: $ARGUMENTS

Follow the skill's product-review reference exactly, including its classification discipline and its read-only boundary. Report findings with artifact IDs and evidence; never fix anything during the review, never invent intent to resolve a contradiction, and never manufacture a quality score. Name the follow-up for each accepted finding.
