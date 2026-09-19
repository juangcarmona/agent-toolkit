# Authoring Agent Skills

Read the current [Agent Skills specification](https://agentskills.io/specification) before relying on remembered behavior. The official format requires a skill directory containing `SKILL.md` with YAML frontmatter and Markdown instructions; `name` and `description` are required.

## Repository conventions

- Create the canonical skill at `skills/<name>/SKILL.md`.
- Keep the collection flat. Categories belong in documentation or package composition, not in the canonical filesystem path.
- Match the directory name and frontmatter `name` exactly.
- Write a description that says what the capability does and when it should activate.
- Use `references/`, `assets/`, and `scripts/` only for material the capability actually needs.
- Link to supporting files relative to the skill root and avoid reference chains deeper than one hop.
- Do not add a copy under `.apm/skills/`, `.agents/skills/`, or a harness-specific directory.
- Do not include consuming-project instructions in a reusable skill.

The specification recommends keeping `SKILL.md` under 500 lines and the loaded instruction body below roughly 5,000 tokens. Treat those as upper bounds, not targets. Metadata is always disclosed; the body loads on activation; supporting resources load only when needed.

## Scripts and dependencies

Bundled scripts increase the trust surface. Prefer declarative instructions when execution is unnecessary. When a script is justified, make inputs explicit, avoid destructive defaults, declare runtime requirements in `compatibility` or nearby documentation, and provide actionable errors. Do not download and execute mutable remote content.

## Review and validation

Run `npm run validate`. The official `agentskills` reference CLI, installed by the `skills-ref` Python package, owns specification checks. Repository checks only add invariants that the upstream validator cannot know: canonical placement, uniqueness, local link integrity, distribution discovery, and APM projection fidelity.

Use the reusable [`agent-skill-authoring` checklist](../../skills/agent-skill-authoring/references/review-checklist.md) for semantic review. Automated checks deliberately do not score prose quality or impose subjective description templates.
