import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { relative, sep } from "node:path";
import YAML from "yaml";
import { pythonTool, repositoryPath, requireSuccess, run } from "./tooling.mjs";

const ignoredDirectories = new Set([".git", ".venv", "node_modules", "apm_modules", "build", "dist", "coverage"]);
const skillsRoot = repositoryPath("skills");
const skillDirectories = readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => repositoryPath("skills", entry.name))
  .sort();

if (skillDirectories.length === 0) {
  throw new Error("No canonical skills were found under skills/.");
}

function parseFrontmatter(skillFile) {
  const content = readFileSync(skillFile, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    throw new Error(`${relative(repositoryPath(), skillFile)} has no YAML frontmatter.`);
  }
  return YAML.parse(match[1]);
}

function findSkillFiles(directory, results = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }
    const path = repositoryPath(relative(repositoryPath(), directory), entry.name);
    if (entry.isDirectory()) {
      findSkillFiles(path, results);
    } else if (entry.name === "SKILL.md") {
      results.push(path);
    }
  }
  return results;
}

function assertNoSymlinks(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = repositoryPath(relative(repositoryPath(), directory), entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Canonical skill content must not use symbolic links: ${relative(repositoryPath(), path)}`);
    }
    if (entry.isDirectory()) {
      assertNoSymlinks(path);
    }
  }
}

const discoveredSkillFiles = findSkillFiles(repositoryPath()).sort();
const canonicalSkillFiles = skillDirectories.map((directory) => repositoryPath(relative(repositoryPath(), directory), "SKILL.md"));
const canonicalSet = new Set(canonicalSkillFiles);

for (const skillFile of discoveredSkillFiles) {
  if (!canonicalSet.has(skillFile)) {
    throw new Error(`SKILL.md outside the canonical skills/<name>/ layout: ${relative(repositoryPath(), skillFile)}`);
  }
}

const names = new Set();
for (const skillDirectory of skillDirectories) {
  if (lstatSync(skillDirectory).isSymbolicLink()) {
    throw new Error(`Canonical skill directories must not be symbolic links: ${relative(repositoryPath(), skillDirectory)}`);
  }
  assertNoSymlinks(skillDirectory);

  const skillFile = repositoryPath(relative(repositoryPath(), skillDirectory), "SKILL.md");
  const metadata = parseFrontmatter(skillFile);
  if (names.has(metadata.name)) {
    throw new Error(`Duplicate skill name: ${metadata.name}`);
  }
  names.add(metadata.name);

  const validation = run(pythonTool("agentskills"), ["validate", skillDirectory], { stdio: "inherit" });
  if (validation.error?.code === "ENOENT") {
    throw new Error("The agentskills reference CLI is unavailable. Run npm run setup:validation first.");
  }
  requireSuccess(validation, `Agent Skills validation for ${relative(repositoryPath(), skillDirectory).split(sep).join("/")}`);
}

console.log(`Validated ${skillDirectories.length} skill(s) with the Agent Skills reference CLI and repository structure rules.`);
