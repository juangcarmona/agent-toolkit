import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { loadDocs } from '../skills/architecture-docs/snapshot/loadDocs.mjs';
import { renderMarkdown, extractMermaidSources, normalizeMermaidSvg } from '../skills/architecture-docs/snapshot/render.mjs';
import { buildSnapshotHtml } from '../skills/architecture-docs/snapshot/shell.mjs';

const require = createRequire(new URL('../skills/architecture-docs/snapshot/package.json', import.meta.url));
const { JSDOM } = require('jsdom');
const execute = promisify(execFile);
const generator = fileURLToPath(new URL('../skills/architecture-docs/snapshot/generate.mjs', import.meta.url));
const routes = new Map([['06-runtime.md', '#/section/06'], ['README.md', '#/']]);

async function fixture(context) {
  const directory = await mkdtemp(join(tmpdir(), 'arc42-test-'));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(join(directory, 'README.md'), '# Architecture\n\nNavigation index.\n');
  for (let index = 1; index <= 12; index += 1) {
    const number = String(index).padStart(2, '0');
    await writeFile(join(directory, `${number}-section.md`),
      `---\ntitle: Section ${number}\narc42-section: "${number}"\ndescription: Evidence for section ${number}.\n---\n## Details\n\nVerified content.\n`);
  }
  return directory;
}

test('plain README and all twelve sections satisfy the contract', async (context) => {
  const docs = await loadDocs(await fixture(context));
  assert.equal(docs.sections.length, 12);
  assert.match(docs.readme.body, /Navigation index/);
});

for (const number of ['01', '06', '12']) {
  test(`missing section ${number} fails, including boundary sections`, async (context) => {
    const directory = await fixture(context);
    await rm(join(directory, `${number}-section.md`));
    await assert.rejects(loadDocs(directory), new RegExp(`section ${number} is missing`));
  });
}

for (const [name, content, diagnostic] of [
  ['6-runtime.md', '# Invalid name', /unexpected Markdown file/],
  ['notes.md', '# Uncarried material', /unexpected Markdown file/],
  ['13-section.md', '---\ntitle: Extra\narc42-section: "13"\ndescription: Extra.\n---\n', /between 01 and 12/],
  ['06-duplicate.md', '---\ntitle: Duplicate\narc42-section: "06"\ndescription: Duplicate.\n---\n', /duplicate section number/],
  ['06-section.md', '# Missing metadata', /missing YAML frontmatter/],
  ['06-section.md', '---\ntitle: null\narc42-section: 6\ndescription: []\n---\n', /must be a nonempty string/],
  ['06-section.md', '---\ntitle: Test\narc42-section: "05"\ndescription: Test.\n---\n', /does not match/],
  ['06-section.md', '---\ntitle: Test\narc42-section: "06"\ndescription: Test.\nowner: Someone\n---\n', /unexpected frontmatter key/],
  ['README.md', '---\ntitle: Test\narc42-section: "01"\n---\n', /README must not carry/],
]) {
  test(`contract rejects ${name}: ${diagnostic}`, async (context) => {
    const directory = await fixture(context);
    await writeFile(join(directory, name), content);
    await assert.rejects(loadDocs(directory), diagnostic);
  });
}

test('raw HTML, event handlers, images, and executable links remain inert', async () => {
  const input = '<img src="https://example.invalid/leak" onerror="alert(1)">\n\n<script>alert(1)</script>\n\n[bad](javascript:alert)\n\n![image](https://example.invalid/image)';
  const { html } = await renderMarkdown(input, { fileToRoute: routes });
  const dom = new JSDOM(html);
  assert.equal(dom.window.document.querySelector('img, script, iframe'), null);
  assert.equal(dom.window.document.querySelector('a'), null);
  assert.match(dom.window.document.body.textContent, /onerror/);
  dom.window.close();
});

test('JSON breakout is blocked and the CSP hash matches the application script', () => {
  const marker = '</script><script>globalThis.__arc42Probe=1</script>';
  const html = buildSnapshotHtml({ readme: { title: marker, description: '', html: '' }, sections: [], stackName: marker });
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const document = dom.window.document;
  assert.equal(document.querySelectorAll('script').length, 2);
  assert.equal(JSON.parse(document.getElementById('arc42-data').textContent).readme.title, marker);
  assert.equal(dom.window.__arc42Probe, undefined);
  const application = document.querySelector('script:not([type])').textContent;
  const hash = createHash('sha256').update(application).digest('base64');
  assert.ok(document.querySelector('[http-equiv]').content.includes(`'sha256-${hash}'`));
  dom.window.close();
});

test('heading IDs are stable and links normalize paths and encode fragments', async () => {
  const { html } = await renderMarkdown('## **Runtime**\n\n## Runtime\n\n[local](#runtime) [next](./06-runtime.md#runtime-1) [home](README.md#architecture) [evidence](../adr/one.md)',
    { fileToRoute: routes, currentRoute: '#/section/06' });
  const dom = new JSDOM(html);
  assert.deepEqual([...dom.window.document.querySelectorAll('h2')].map((element) => element.id), ['runtime', 'runtime-1']);
  assert.deepEqual([...dom.window.document.querySelectorAll('a')].map((element) => element.getAttribute('href')),
    ['#/section/06/runtime', '#/section/06/runtime-1', '#/architecture']);
  assert.match(html, /xref-dead/);
  dom.window.close();
});

test('Mermaid uses Markdown fence semantics, including tilde and nested fences', async () => {
  const body = '````markdown\n```mermaid\ngraph TD; Fake-->Example\n```\n````\n\n~~~mermaid\ngraph TD; Real-->Diagram\n~~~\n\n> ```mermaid\n> graph TD; Nested-->Diagram\n> ```';
  const sources = extractMermaidSources(body);
  assert.deepEqual(sources, ['graph TD; Real-->Diagram', 'graph TD; Nested-->Diagram']);
  const { html, mermaidCount } = await renderMarkdown(body, { fileToRoute: routes, svgs: ['<svg id="one"></svg>', '<svg id="two"></svg>'] });
  assert.equal(mermaidCount, 2);
  assert.match(html, /Fake--&gt;Example/);
  assert.equal((html.match(/<figure/g) ?? []).length, 2);
});

test('unmatched diagram counts fail rather than hiding missing diagrams', async () => {
  await assert.rejects(renderMarkdown('```mermaid\ngraph TD; A-->B\n```', { fileToRoute: routes }), /count does not match/);
  await assert.rejects(renderMarkdown('No diagrams', { fileToRoute: routes, svgs: ['<svg/>'] }), /Unused Mermaid/);
});

test('SVG sanitization preserves labels, colors, internal references and unique IDs', () => {
  const source = '<svg xmlns="http://www.w3.org/2000/svg" id="my-svg" style="max-width: 120.4px"><style>#my-svg .node{fill:#fff} #my-svg_node{stroke:red}</style><defs><marker id="arrow"/></defs><g id="my-svg_node" class="node" marker-end="url(#arrow)"><text>my-svg service</text></g></svg>';
  const first = normalizeMermaidSvg(source, 1);
  const second = normalizeMermaidSvg(source, 2);
  assert.match(first, /my-svg service/);
  assert.match(first, /#mmd-1 \.node/);
  assert.match(first, /stroke:red/);
  assert.match(first, /max-width: 120px/);
  const dom = new JSDOM(first + second);
  const ids = [...dom.window.document.querySelectorAll('[id]')].map((element) => element.id);
  assert.equal(new Set(ids).size, ids.length);
  const marker = dom.window.document.querySelector('marker').id;
  assert.equal(dom.window.document.querySelector('g').getAttribute('marker-end'), `url(#${marker})`);
  dom.window.close();
});

test('SVG strips executable content, remote resources and external styles', () => {
  const source = '<svg xmlns="http://www.w3.org/2000/svg" id="my-svg" onload="alert(1)"><script>alert(1)</script><style>@import "https://example.invalid/style";</style><image href="https://example.invalid/image"/><a href="javascript:alert(1)"><text onclick="alert(1)">Safe label</text></a><rect style="fill:url(https://example.invalid/fill)"/></svg>';
  const clean = normalizeMermaidSvg(source, 0);
  assert.doesNotMatch(clean, /onload|onclick|<script|<image|@import|example\.invalid|javascript:/);
  assert.match(clean, /Safe label/);
});

test('router navigates to section and overview headings with correct sidebar state', async () => {
  const readme = await renderMarkdown('## Architecture\n\nOverview.', { fileToRoute: routes });
  const section = await renderMarkdown('## Runtime\n\nRuntime evidence.', { fileToRoute: routes, currentRoute: '#/section/06' });
  const html = buildSnapshotHtml({ readme: { title: 'Overview', description: '', html: readme.html },
    sections: [{ number: '06', title: 'Runtime', description: '', html: section.html }], stackName: 'Test' });
  const dom = new JSDOM(html, { url: 'file:///snapshot.html#/section/06/runtime?a=dark', runScripts: 'dangerously',
    beforeParse(window) { window.HTMLElement.prototype.scrollIntoView = function () { this.dataset.scrolled = 'true'; }; } });
  const { document } = dom.window;
  assert.equal(document.getElementById('runtime').dataset.scrolled, 'true');
  assert.equal(document.querySelector('[aria-current="page"]').getAttribute('href'), '#/section/06');
  dom.window.location.hash = '#/architecture';
  dom.window.dispatchEvent(new dom.window.Event('hashchange'));
  assert.equal(document.getElementById('architecture').dataset.scrolled, 'true');
  dom.window.close();
});

test('CLI generates deterministically, keeps authored files intact and fails with exit 2 on contract errors', async (context) => {
  const directory = await fixture(context);
  const outFile = join(directory, 'snapshot.html');
  const readmeBefore = await readFile(join(directory, 'README.md'), 'utf8');
  await execute(process.execPath, [generator, directory, '--out', outFile]);
  const first = await readFile(outFile, 'utf8');
  await execute(process.execPath, [generator, directory, '--out', outFile]);
  assert.equal(await readFile(outFile, 'utf8'), first);
  assert.equal(await readFile(join(directory, 'README.md'), 'utf8'), readmeBefore);
  await assert.rejects(execute(process.execPath, [generator, directory, '--out', join(directory, 'README.md')]), (error) => error.code === 2);
  await assert.rejects(execute(process.execPath, [generator, directory, '--out']), (error) => error.code === 1);
  await rm(join(directory, '12-section.md'));
  await assert.rejects(execute(process.execPath, [generator, directory, '--out', outFile]), (error) => error.code === 2);
  assert.equal(await readFile(outFile, 'utf8'), first);
});