/**
 * render.mjs — Markdown → HTML pipeline for the arc42 snapshot.
 *
 *  - Markdown rendered with `marked`, fully escaped by it (authored content never
 *    becomes executable).
 *  - ```mermaid fenced blocks are extracted and pre-rendered to inline SVG at
 *    build time via mermaid-cli; the SVGs are normalized for determinism.
 *  - Relative .md links between sections are rewritten to hash routes
 *    (#/section/NN). Links to anything outside the docs folder (evidence paths,
 *    ../adr/...) become inert monospaced text: a single file cannot carry them.
 */
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Marked } from 'marked';
import { run } from '@mermaid-js/mermaid-cli';

/** Escape text for safe interpolation into HTML. */
export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Normalize a mermaid-cli SVG for inlining in the single snapshot file:
 *
 *  - strip the XML prolog, comments and the xlink namespace declaration;
 *  - give the diagram a unique root id (mmd-<index>) and rewrite EVERY
 *    internal reference to it. Mermaid hardcodes the root id "my-svg" in the
 *    id attribute, in its internal <style> selectors (#my-svg .node …) and
 *    in generated ids (my-svg_flowchart-v2-pointEnd), so a plain token
 *    replacement keeps mermaid's own styling alive — renaming the id without
 *    rewriting the selectors would silently drop every fill, font and
 *    classDef colour — and unique ids stop multiple diagrams colliding;
 *  - keep only a rounded intrinsic max-width on the root, dropping the rest
 *    of the inline style (and any sub-pixel layout jitter with it);
 *  - renumber the remaining generated ids under the same unique prefix so
 *    url(#…) references cannot cross between diagrams.
 */
function normalizeMermaidSvg(svg, index) {
  let out = svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\sxmlns:xlink="[^"]*"/g, '');

  // Unique root id: replace the token everywhere it occurs (id, selectors, refs).
  const rootId = `mmd-${index}`;
  out = out.replace(/my-svg/g, rootId);

  // Root style: keep only the intrinsic max-width, rounded to whole pixels.
  out = out.replace(/\sstyle="([^"]*)"/, (m, css) => {
    const widthMatch = /max-width:\s*([\d.]+)px/.exec(css);
    return widthMatch ? ` style="max-width: ${Math.round(Number(widthMatch[1]))}px"` : '';
  });

  // Renumber remaining generated ids under the diagram's own prefix. The
  // root id must be skipped: mermaid's internal <style> targets it by name.
  const idMap = new Map();
  const remap = (id) => {
    if (id === rootId) return id;
    if (!idMap.has(id)) idMap.set(id, `${rootId}-x${idMap.size + 1}`);
    return idMap.get(id);
  };
  out = out.replace(/\sid="([^"]+)"/g, (_m, id) => ` id="${remap(id)}"`);
  out = out.replace(/url\(#([^)]+)\)/g, (_m, id) => `url(#${remap(id)})`);
  out = out.replace(/href="#([^"]+)"/g, (_m, id) => ` href="#${remap(id)}"`);

  return out.trim();
}

/**
 * Pre-render mermaid diagram sources to normalized inline SVGs.
 * @param {string[]} sources mermaid diagram sources, in document order
 * @returns {Promise<string[]>} normalized SVG strings
 */
export async function renderMermaid(sources) {
  if (sources.length === 0) return [];
  const staging = await mkdtemp(join(tmpdir(), 'arc42-mermaid-'));
  try {
    const svgFiles = [];
    for (let i = 0; i < sources.length; i += 1) {
      const inFile = join(staging, `d${i}.mmd`);
      const outFile = join(staging, `d${i}.svg`);
      await writeFile(inFile, sources[i], 'utf8');
      await run(inFile, outFile, {
        quiet: true,
        outputFormat: 'svg',
        parseMMDOptions: { backgroundColor: 'transparent' },
      });
      const raw = await readFile(outFile, 'utf8');
      svgFiles.push(normalizeMermaidSvg(raw, i));
    }
    return svgFiles;
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

/**
 * Build a marked instance configured for the arc42 snapshot.
 *
 * @param {Map<string,string>} fileToRoute maps section file names (and README.md)
 *        to hash routes, e.g. "05-building-block-view.md" -> "#/section/05"
 * @param {(svgIndex: number) => string} svgPlaceholder returns the placeholder
 *        token for the nth mermaid diagram
 */
function createMarked(fileToRoute, svgPlaceholder) {
  const marked = new Marked({ gfm: true });
  let mermaidCount = 0;

  marked.use({
    renderer: {
      // Fenced code: mermaid blocks become placeholders resolved after rendering.
      code({ text, lang }) {
        if (lang === 'mermaid') {
          const index = mermaidCount;
          mermaidCount += 1;
          return svgPlaceholder(index);
        }
        const escaped = escapeHtml(text);
        return `<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escaped}</code></pre>\n`;
      },
      // Links: rewrite relative .md links to hash routes; anything else that
      // points outside the single file becomes inert monospaced text.
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const cleanHref = String(href ?? '');
        if (/^(https?:|mailto:|#|\/)/.test(cleanHref)) {
          // External or absolute: keep as a real link only if it is a plain URL.
          if (/^(https?:|mailto:)/.test(cleanHref)) {
            const t = title ? ` title="${escapeHtml(title)}"` : '';
            return `<a href="${escapeHtml(cleanHref)}"${t} rel="noopener">${text}</a>`;
          }
          return `<span class="xref-dead">${text} <code>${escapeHtml(cleanHref)}</code></span>`;
        }
        const target = cleanHref.split('#')[0];
        const anchor = cleanHref.includes('#') ? cleanHref.split('#').slice(1).join('#') : '';
        if (target && fileToRoute.has(target)) {
          const route = fileToRoute.get(target);
          const hash = anchor ? `${route}/${anchor}` : route;
          return `<a href="${hash}">${text}</a>`;
        }
        // Evidence path or other non-carried file: inert, monospaced, honest.
        return `<span class="xref-dead">${text} <code>${escapeHtml(cleanHref)}</code></span>`;
      },
      image({ href, title, text }) {
        // No images are carried in the single file; name them honestly.
        return `<span class="xref-dead">[image: ${escapeHtml(String(text ?? ''))}] <code>${escapeHtml(String(href ?? ''))}</code></span>`;
      },
    },
  });

  return marked;
}

/**
 * Render one Markdown document to HTML.
 *
 * @param {string} body markdown source (frontmatter already stripped)
 * @param {object} opts
 * @param {Map<string,string>} opts.fileToRoute section file name -> hash route
 * @param {string[]} opts.svgs pre-rendered mermaid SVGs for this document
 * @param {string} opts.svgClass css class for inline svg wrappers
 */
export async function renderMarkdown(body, { fileToRoute, svgs = [], svgClass = 'diagram' }) {
  let svgIndex = 0;
  const marked = createMarked(fileToRoute, (index) => `\u0000MERMAID${index}\u0000`);
  const html = await marked.parse(body);

  // Resolve mermaid placeholders to inline SVGs.
  const withSvgs = html.replace(/\u0000MERMAID(\d+)\u0000/g, (_m, digits) => {
    const i = Number(digits);
    const svg = svgs[i] ?? '';
    svgIndex = Math.max(svgIndex, i + 1);
    return svg
      ? `<figure class="${svgClass}">${svg}</figure>`
      : '<p class="diagram-missing">[diagram could not be rendered]</p>';
  });

  return { html: withSvgs, mermaidCount: svgIndex };
}

/**
 * Extract mermaid sources and a body with placeholders removed is not needed:
 * instead we count diagrams by scanning fenced blocks before rendering, so the
 * SVGs can be pre-rendered in one batch per document.
 */
export function extractMermaidSources(body) {
  const sources = [];
  const fence = /```mermaid\r?\n([\s\S]*?)```/g;
  let match;
  while ((match = fence.exec(body)) !== null) {
    sources.push(match[1]);
  }
  return sources;
}
