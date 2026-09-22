import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { repositoryPath } from "./tooling.mjs";

const ignoredDirectories = new Set([".git", ".venv", ".venv-linux", "node_modules", "apm_modules", "build", "dist", "coverage"]);
const markdownFiles = [];

function collectMarkdown(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      collectMarkdown(path);
    } else if (entry.name.toLowerCase().endsWith(".md")) {
      markdownFiles.push(path);
    }
  }
}

collectMarkdown(repositoryPath());
const failures = [];

for (const markdownFile of markdownFiles) {
  const lines = readFileSync(markdownFile, "utf8").split(/\r?\n/);
  let inFence = false;

  lines.forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) {
      return;
    }

    const linkPattern = /!?\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+["'][^"']*["'])?\)/g;
    for (const match of line.matchAll(linkPattern)) {
      let target = match[1].replace(/^<|>$/g, "");
      if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) {
        continue;
      }

      target = target.split("#", 1)[0].split("?", 1)[0];
      if (!target) {
        continue;
      }

      try {
        target = decodeURIComponent(target);
      } catch {
        failures.push(`${relative(repositoryPath(), markdownFile)}:${index + 1}: invalid percent-encoding in ${match[1]}`);
        continue;
      }

      const resolved = target.startsWith("/")
        ? repositoryPath(target.slice(1))
        : resolve(dirname(markdownFile), target);
      if (!existsSync(resolved)) {
        failures.push(`${relative(repositoryPath(), markdownFile)}:${index + 1}: missing local target ${match[1]}`);
      }
    }
  });
}

if (failures.length > 0) {
  throw new Error(`Broken Markdown links:\n${failures.join("\n")}`);
}

console.log(`Validated local links in ${markdownFiles.length} Markdown file(s).`);
