---
name: agent-skill-authoring
description: Design, write, and review portable Agent Skills with focused instructions and progressively disclosed resources. Use when creating or substantially changing a SKILL.md capability intended for reuse across repositories or agent harnesses.
license: MIT
metadata:
  author: juangcarmona
---

# Agent Skill Authoring

Create a reusable capability that follows the current [Agent Skills specification](https://agentskills.io/specification) and remains independent of a particular agent harness unless the capability intrinsically requires one.

## Workflow

1. Confirm that the proposed content is a reusable capability. Keep repository-specific paths, policies, and commands in the consuming repository's instructions.
2. Define one observable responsibility and the situations that should activate it. If the proposal combines unrelated responsibilities, split it before writing.
3. Choose a lowercase, hyphenated name that matches the skill directory. Write a description that states both what the skill does and when to use it.
4. Keep `SKILL.md` focused on the operational path. Put detailed background in `references/`, reusable output material in `assets/`, and executable helpers in `scripts/` only when each resource earns its maintenance and trust cost.
5. Reference resources with paths relative to the skill root and keep reference chains shallow.
6. Document environment requirements in `compatibility` only when they are real. Avoid optional frontmatter fields that merely restate the body.
7. Review the capability against [the review checklist](references/review-checklist.md), then run the repository's official and custom validation commands.

## Boundaries

- Use a skill for reusable knowledge or a repeatable workflow that benefits from on-demand loading.
- Use repository instructions for always-on local context and constraints.
- Use a prompt or command for an explicit user-invoked entry point.
- Use an agent when isolated context, a distinct role, or delegated execution is the essential behavior.
- Use a hook for deterministic lifecycle automation, not advice.
- Use a package or plugin to compose and distribute primitives without copying their canonical sources.

Do not claim cross-harness behavior that has not been exercised. Treat scripts, imported references, and generated outputs as supply-chain inputs that require review.
