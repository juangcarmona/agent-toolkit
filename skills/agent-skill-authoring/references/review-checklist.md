# Agent Skill Review Checklist

Use this checklist for human review after automated validation passes.

## Scope

- The capability is reusable outside the repository where it was authored.
- The skill has one coherent responsibility and does not hide unrelated workflows.
- Project-specific context remains in the consuming project's instructions.
- A skill is the right primitive; the content is not better expressed as an instruction, prompt, agent, hook, or package.

## Discovery and disclosure

- The directory and frontmatter `name` match.
- The description says what the skill does and when it should activate, using concrete task vocabulary.
- The main instructions are sufficient to start the task without loading every reference.
- Detailed material is split into focused, directly referenced files only when needed.

## Portability and safety

- Harness-specific assumptions are explicit and intrinsic, not accidental.
- Relative file references resolve from the skill root.
- Scripts declare dependencies, validate inputs, fail clearly, and avoid destructive defaults.
- Remote or third-party content is treated as untrusted input and cannot silently override higher-priority instructions.
- No secrets, credentials, personal paths, proprietary material, or generated runtime artifacts are included.

## Evidence

- The official `agentskills` reference CLI passes.
- Repository structure and link validation pass.
- At least one supported distribution path discovers the skill.
- Any claimed harness-specific behavior has a recorded smoke test or an explicit limitation.
