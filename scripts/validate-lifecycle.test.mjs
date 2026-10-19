import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../packages/agentic-sdlc/', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('GitHub defaults define one canonical lifecycle status and separate overlays', async () => {
  const standard = await read('skills/adopt/references/github-label-standard.md');
  for (const label of [
    'status:backlog',
    'status:ready',
    'status:proposed',
    'status:in-progress',
    'status:in-review',
    'status:done',
  ]) assert.ok(standard.includes(`\`${label}\``));
  assert.match(standard, /Every open issue has exactly one `status:\*` label/);
  assert.match(standard, /`blocked` and `owner-review` are optional overlays/);
  assert.match(standard, /A post-merge retrospective is recorded by `review` and does not add another lifecycle status/);
  assert.match(standard, /draft PR contains implementation work/);
  assert.match(standard, /Never infer `done` from a closed issue alone/);
});

test('defaults adoption resets owned configuration and safely migrates recognized open issues', async () => {
  const adopt = await read('skills/adopt/SKILL.md');
  assert.match(adopt, /explicit `adopt defaults` invocation authorizes the bounded reset/);
  assert.match(adopt, /Do not remove a file that is absent from the prior Installed roles table/);
  assert.match(adopt, /Leave ambiguous issues.*all closed issues unchanged/);
  assert.match(adopt, /Never delete a GitHub label/);
  assert.match(adopt, /docs\/delivery\/ff\/<work-item-id>\/<run-id>\//);
});

test('ordinary adoption remains idempotent and preserves established labels', async () => {
  const adopt = await read('skills/adopt/SKILL.md');
  assert.match(adopt, /Adoption is idempotent/);
  assert.match(adopt, /never rename, delete, recolor, or repurpose a label with existing usage/);
  assert.match(adopt, /A second adoption pass with no repository drift proposes no duplicate labels/);
});

test('review records are per-item and created once', async () => {
  const entry = await read('skills/review-entry/SKILL.md');
  const status = await read('skills/status/SKILL.md');
  assert.match(entry, /docs\/reviews\/issue-<number>\.md/);
  assert.match(entry, /Create the file exclusively/);
  assert.match(entry, /If the target exists, stop and report it/);
  assert.match(status, /Report review debt/);
  assert.match(status, /per-item retrospective/);
});

test('Fast Forward composes PR and merge stages with bounded independent review', async () => {
  const ff = await read('skills/ff/SKILL.md');
  const labels = await read('skills/adopt/references/github-label-standard.md');
  for (const stage of ['refine', 'propose', 'implement', 'integrate', 'review']) assert.match(ff, new RegExp(`\\b${stage}\\b`));
  assert.match(ff, /different models/);
  assert.match(ff, /correction rounds/);
  assert.match(labels, /merge only when all lifecycle gates pass and forge protection permits it/i);
  assert.match(ff, /branch protection/);
  assert.match(ff, /`awaiting-integration`, or `complete`/);
  assert.match(labels, /prepare and update the pull request, push its branch, and merge/);
  for (const field of ['schemaVersion', 'executorModel', 'reviewerModel', 'stages', 'reviews', 'corrections', 'stopReason']) assert.ok(ff.includes(`\`${field}\``));
});

test('status reports the Fast Forward decision against the commit it reviewed', async () => {
  const status = await read('skills/status/SKILL.md');
  assert.match(status, /Report Fast Forward history/);
  assert.match(status, /A review decision is valid only for the commit SHA/);
  assert.match(status, /Do not resume, edit, or repair a run record/);
});
