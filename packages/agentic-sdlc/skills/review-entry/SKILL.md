---
name: review-entry
description: "Append one dated entry to the project's review log after a change has merged: what worked, what did not, what to change next time, plus the effort figures the caller supplies. Use when closing out a loop."
metadata:
  plugin: agentic-sdlc
  author: "juangcarmona"
---

## Purpose

One responsibility: append **exactly one** dated entry to the project's review log. Append-only: the log is a record, and a record that gets rewritten is not one.

**This skill does not compute effort figures.** The caller runs `collect-usage` and passes the numbers in. Nothing here starts a collector, reads telemetry, or re-derives a figure.

## When to use

- At loop close-out, when `review` has drafted the reflections for a merged work item.
- When recording a retrospective for a completed work item.
- When a post-merge finding needs capturing where the team will meet it again.

## When not to use

- Measuring effort. That is `collect-usage`, whose output this skill records.
- Proposing an amendment to the Definition of Ready or Definition of Done. This skill notes that one is warranted and names where it goes; `review` proposes it and a human confirms it.
- Authoring the decision record itself. That is `adr`; put its identifier on the amendment line.

## Workflow

The caller supplies the work item identifier and a short title, the date (`YYYY-MM-DD`, defaulting to today), the three reflections (**what worked**, **what did not**, **what to change next time**), the effort figures **and their source**, and the log path. The log path defaults to `docs/review-log.md`, which the project's lifecycle configuration overrides when the team keeps one elsewhere.

1. **Read the log** to find where it ends and to match the entry format its own header documents. Do not parse or modify existing entries: read only far enough to write the next one correctly. *Done when:* the file's format and its last entry are in hand.
2. **Compose one entry**: a dated heading carrying the item identifier and title, then the three reflections, the effort figures, and the amendment line. *Done when:* every field is filled or explicitly marked absent.
3. **Name the effort source.** The figures line says where the numbers came from, so a reader knows what they cover. Telemetry missing means write `not captured`. **Never invent a number to fill the line**, and never round an absent figure up to a plausible one. *Done when:* every figure carries a source, or is marked `not captured`.
4. **Route what graduates.** A reflection that is a recurring, structural change to how the team works does not belong buried in prose:
   - a decision with lasting trade-offs becomes an ADR candidate, and the resulting record's identifier goes on the entry's amendment line;
   - a missing guard the process should have had is noted for hardening;
   - a gap in what the team calls ready or done is noted as a proposed amendment to their Definition of Ready or Definition of Done.

   *Done when:* each structural reflection names its destination, or the amendment line reads `none`.
5. **Append, and only append.** The entry becomes the **last** block in the file. Every existing byte above it is untouched: no edits, no reordering, no deletions. *Done when:* the file's prior content is byte-identical and the new entry is last.
6. **Report** the appended entry and the file path to the caller. *Done when:* the caller knows what was written and where.

## Validation

- Exactly one entry was added, and it is the last block in the file.
- Every byte above it is unchanged.
- The entry follows the format the log's own header documents.
- Every figure carries a source, or reads `not captured`.
- Each structural reflection names its destination, or the amendment line reads `none`.
- No telemetry was read and no collector was started from here.

## Common pitfalls

| Pitfall | Fix |
|---|---|
| Editing, reordering or deleting a prior entry | Append-only. A correction is a new, later entry that says what it corrects |
| Batching several work items into one call | One entry per invocation |
| Reaching for telemetry to fill a missing figure | Figures come from the caller. `collect-usage` measures them |
| Writing a plausible number instead of `not captured` | Honest absence beats an invented figure, which corrupts every summary built on the log afterwards |
| Leaving a structural lesson as prose in the entry | It graduates to a decision record or an amendment to the team's definitions, linked from the entry |
| Proposing the amendment here | Note that one is warranted and name where it goes. `review` proposes it, a human confirms it |
| Calling another skill from here | Composition happens in the calling capability |
| Rewriting the log to a tidier format | The log's existing format is the format |
