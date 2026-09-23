---
name: refine
description: Improve an existing slice of product definition by reasoning across neighbouring concepts, detecting contradiction, duplication, terminology drift, missing rules, missing outcomes, unclear boundaries and excessive complexity.
argument-hint: "[journey | use-case | artifact-id | product area]"
metadata:
  plugin: product-definition
  author: "juangcarmona"
---

Carry out the `product-definition` skill's **connect** and **review** phases over: $ARGUMENTS

Read the slice and its neighbourhood in the graph (one ring out, minimum). Detect and report: contradiction between rules or between a flow and its governing rules; duplication of the same fact across artifacts; terminology drift (one word two meanings, two words one meaning); missing rules a flow implies; missing outcomes a journey promises; unclear boundaries between concepts; excessive complexity serving rare cases.

Propose improvements as concrete diffs. In a PDaC repository, semantic improvements become Product Change candidates a human elaborates and approves; never edit the accepted model directly. In general mode, present the diffs for review.
