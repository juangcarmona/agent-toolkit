---
name: adopt
description: "Bootstrap or reconcile a project's lifecycle configuration: Definition of Ready, Definition of Done, role capabilities. Use when onboarding a repository, or after its tooling, roles or process changed."
metadata:
  plugin: agentic-sdlc
  author: "juangcarmona"
---

## Purpose

Establish and keep current this project's lifecycle configuration, `docs/engineering-lifecycle.md`, and the role capabilities that go with it. Discover how the team already works and write that down; never impose a tracker, a forge, a CI system or a methodology.

Run in one of two modes, detected from the repository rather than asked for. **Bootstrap** when no configuration exists. **Reconcile** when it does. Reconcile is the normal mode for the life of the project.

The configuration belongs to the project once bootstrap has run. The templates in `assets/role-skills/` are starting points, not authoritative copies, so reconcile works against what the project has made of them and preserves customisation by default.

## When to use

- Onboarding a repository onto the development lifecycle for the first time.
- The tracker, forge, CI system or test tooling changed.
- The team's roles, policies or engineering process changed.
- A lifecycle capability stopped and reported that no configuration exists.
- Periodically, to find Definition of Done items that can move from the judgement lane to the deterministic lane.

## When not to use

- Running a work item through the loop. Use `refine`, `propose`, `implement`, `integrate` or `review`.
- Asking where an item stands. Use `status`.
- Amending the configuration from delivery evidence after a cycle closes. That is `review`, which proposes the amendment; this capability is for changes driven by the toolchain or the process rather than by one cycle's lesson.

## Workflow

Every write, in either mode, is shown to a human and confirmed before it happens. This capability fires no tracker transition, merges nothing, deletes nothing, and runs no destructive command.

### 1. Detect the mode

Read `docs/engineering-lifecycle.md`. Absent means **bootstrap**. Present means **reconcile**. State which mode is running before doing anything else.

*Done when:* the mode is named out loud.

### 2. Discover before asking, in both modes

Resolve everything the repository and its tooling can answer, and bring findings as confirmations rather than blank questions:

- the tracker, the forge, the CI system;
- the test frameworks, analyzers, formatters and scanners the pipeline already runs, which is most of the deterministic half of the Definition of Done and is discoverable from the pipeline configuration itself;
- whether a specification tool is present;
- the harness directories already in the repository (`.agents/skills/`, `.claude/skills/`);
- any role capabilities a previous run installed.

*Done when:* every discoverable fact is in hand and the human has seen the list.

### 3. Bootstrap: derive the Definition of Ready

Walk [`assets/definition-of-ready.md`](assets/definition-of-ready.md) with the team: one concrete question per dimension, about their actual work items, with the reference on the table. Never ask "do you have a Definition of Ready?"; that question produces a shrug.

Each answer produces **keep**, **adapt**, or **drop with a recorded reason**. Then the question no reference can answer:

> What else must be true before your team is comfortable saying: *this item is ready to be planned*?

*Done when:* every dimension has a disposition and the team's own additions are captured.

### 4. Bootstrap: derive the Definition of Done

Walk [`assets/definition-of-done.md`](assets/definition-of-done.md) the same way, leading with what step 2 found in CI. For every dimension the team keeps, settle two further things: its **lane**, deterministic, judgement or both, and for judgement items the **role** that decides.

Push against both failure modes. Everything in the judgement lane means the loop automates nothing and the definition is theatre. Everything in the deterministic lane means nobody ever looks at the change, and human review is not satisfiable mechanically.

Then the closing question again, for what the reference does not cover.

*Done when:* every dimension has a disposition, a lane, and where it needs one a named role.

### 5. Bootstrap: map the lifecycle onto the project's states

The stage-to-state mapping, the transitions each stage fires, the fields each transition's screen requires, whether the team caps work in progress, whether they commit to sprints.

**Every identifier is resolved from live tooling in this session.** A transition id transcribed from a diagram or from memory breaks the loop a month later, and the failure will look like something else entirely.

*Done when:* every value in the mapping was verified against the real system.

### 6. Reconcile: inspect what exists and name the drift

Read the configuration, its Definition of Ready and Definition of Done, the installed role capabilities listed under **Installed roles**, and the project's own customisations. Then report three things, separately:

- **Missing capabilities**: roles the team's current practice needs that are not installed.
- **Stale assumptions**: values that no longer resolve against live tooling, such as a moved tracker, a transition id that has gone, a check that disappeared from the pipeline, or a role nobody fills.
- **Improvements**: the most valuable being Definition of Done items that can move from the judgement lane to the deterministic lane, now that tooling exists which did not before.

Report what is drifting even when nothing needs changing. A clean reconcile is a useful result.

*Done when:* the three lists exist, each item resolved against live tooling rather than assumed.

### 7. Reconcile: propose every change as a diff

Nothing in an established configuration changes without a shown diff and an explicit human confirmation, section by section and capability by capability.

- Preserve project customisation. Where a template has moved on and the project has adapted its copy, show both and let the human choose; never regenerate over the adaptation.
- A role capability a previous run installed that the project no longer needs is **reported, not deleted**.
- Decline is a valid answer and is recorded in the amendment log with its reason.

*Done when:* every proposed change was confirmed or declined, and nothing was written that was not confirmed.

### 8. Install or update the role capabilities

For each required role (`read-work-item`, `transition-work-item`, `open-pull-request`, `inspect-ci-result`, `merge-pull-request`) and each further role the team's practice calls for:

1. Take the template from [`assets/role-skills/`](assets/role-skills).
2. Pick the reference matching this project's tooling.
3. Adapt it, replacing every placeholder with a verified value.
4. Write it to `.agents/skills/<role>/SKILL.md`, renamed from `SKILL.template.md`. That file is the source the project owns.

Where no reference matches, author against the contract following [`references/adapting-role-templates.md`](references/adapting-role-templates.md) and **record that it was authored, not adapted**. A fabricated reference is worse than a missing one, because everything downstream trusts it.

**Install only what is needed.** A team without sprints gets no sprint role and no mention of one. Agile does not imply Scrum.

Where a specification tool is present and generates its own skills under the same names, run its initialiser and do not install the plan-artifact templates: a vendored copy would drift from what the tool produces and collide with it. Instead, record in **Provided roles** which generated skill satisfies each plan-artifact contract (`propose-change`, `apply-change`, `sync-specs`, `archive-change`), with the name resolved from live tooling in this session. The lifecycle stages dispatch on that record; without it they call a role that was never installed.

*Done when:* every installed role has a verified implementation, every uninstalled role has a reason, and every role provided by a specification tool is recorded with its live-resolved name.

### 9. Make the capabilities reachable from every harness the team runs

`.agents/skills/` is read natively by GitHub Copilot. Claude Code reads `.claude/skills/`. Copy each adapted `SKILL.md` into the directories the team's harnesses actually read, and say plainly which files are copies and that `.agents/skills/` remains the file to edit.

Whether the copies are committed is the project's decision and follows how it already treats generated files. Record the decision in the configuration; do not impose one.

*Done when:* every installed role is reachable from every harness the team runs, and the team knows which files are source and which are copies.

### 10. Write the configuration

Fill [`assets/engineering-lifecycle.md`](assets/engineering-lifecycle.md) and write it to `docs/engineering-lifecycle.md`. Show it and confirm before writing. In reconcile mode, write only the confirmed sections and append to the amendment log.

Its section headings are a **contract**: every lifecycle capability locates what it needs by heading. Headings are never renamed or removed, even when a section is empty. The full contract, including which capability reads which section, is in [`references/configuration-contract.md`](references/configuration-contract.md).

This file is the adopted lifecycle contract. It is not `CLAUDE.md`, `AGENTS.md` or a Copilot instructions file. Those are harness context files; one may point at the configuration but never replaces it.

### 11. Report

What was installed or changed, what was detected and declined and why, what needs doing by hand such as a board's own column limits which no tooling reaches, which files are copies, and what to run next. Name the next capability; do not run it.

*Done when:* the human knows the state of their configuration and what follows.

## Validation

- The mode was detected from the repository and stated, not guessed or asked for.
- Every value written was resolved from live tooling in this session.
- Every file write was shown and confirmed before it happened.
- In reconcile mode, no established configuration or adapted capability was overwritten without a shown diff and a confirmation.
- `docs/engineering-lifecycle.md` carries every contract heading, including the empty ones.
- Every installed role capability resolves from every harness directory the team runs.
- The **Installed roles** table lists what exists, with what each was adapted from.
- No transition was fired and no knowledge base was touched.

## Common pitfalls

| Pitfall | Fix |
|---|---|
| Asking "do you have a Definition of Done?" | Walk the reference one dimension at a time, against their real work items |
| Imposing the reference as a standard to comply with | It is material to walk. Dropping a dimension with a recorded reason is a valid outcome |
| Writing a value that was not verified this session | Resolve it from live tooling or leave the placeholder and say so |
| Regenerating an adapted capability from its template | Show both versions and let the human choose. Customisation is the project's, not the plugin's |
| Deleting a role the project stopped needing | Report it. Deletion is the project's call |
| Putting everything in the judgement lane | The loop then automates nothing. Push for what CI already settles |
| Putting human review in the deterministic lane | It is not satisfiable mechanically |
| Installing every role capability because they exist | Every unnecessary skill is permanent context cost and one more thing to keep true |
| Writing an adapted capability only into a harness directory | `.agents/skills/` is the source. A copy with no source behind it is lost the next time anything is regenerated |
| Running the next stage after reporting | Adoption ends by naming what follows |
