import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename } from "node:path";
import YAML from "yaml";
import { repositoryPath, run } from "./tooling.mjs";

// The Claude Code marketplace (.claude-plugin/marketplace.json) is the install path for Claude Code
// users and must stay consistent with the package metadata APM and the skills CLI read. Each check
// below guards a way the two have drifted apart before: a package's Claude manifest naming other
// dependencies than its apm.yml, a version bumped in one place, or an agent whose frontmatter name
// Claude Code would not accept.

const problems = [];
const fail = (message) => problems.push(message);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function frontmatter(path) {
  const match = readFileSync(path, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match ? YAML.parse(match[1]) : null;
}

const marketplacePath = repositoryPath(".claude-plugin", "marketplace.json");
if (!existsSync(marketplacePath)) {
  throw new Error("Missing .claude-plugin/marketplace.json.");
}

const marketplace = readJson(marketplacePath);
const entries = marketplace.plugins ?? [];
const entryNames = entries.map((entry) => entry.name);
for (const name of new Set(entryNames.filter((name, index) => entryNames.indexOf(name) !== index))) {
  fail(`Marketplace plugin name "${name}" is declared more than once.`);
}

// Skills each marketplace plugin ships from the canonical root skills/ tree.
const skillsByPlugin = new Map();
for (const entry of entries) {
  if (typeof entry.source === "string" && entry.source !== "./") {
    continue;
  }
  const skills = [];
  for (const path of entry.skills ?? []) {
    const match = path.match(/^\.\/skills\/([^/]+)$/);
    if (!match) {
      fail(`Plugin "${entry.name}": skill path "${path}" must be ./skills/<name>.`);
      continue;
    }
    if (!existsSync(repositoryPath("skills", match[1], "SKILL.md"))) {
      fail(`Plugin "${entry.name}": ${path} has no SKILL.md.`);
    }
    skills.push(match[1]);
  }
  skillsByPlugin.set(entry.name, skills);
}

const packagesRoot = repositoryPath("packages");
const packageNames = readdirSync(packagesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const packageName of packageNames) {
  const packageRoot = repositoryPath("packages", packageName);
  const entry = entries.find((candidate) => candidate.name === packageName);
  if (!entry) {
    fail(`Package "${packageName}" has no entry in .claude-plugin/marketplace.json.`);
    continue;
  }
  if (entry.source !== `./packages/${packageName}`) {
    fail(`Marketplace entry "${packageName}" must use source ./packages/${packageName}.`);
  }

  const manifestPath = repositoryPath("packages", packageName, ".claude-plugin", "plugin.json");
  if (!existsSync(manifestPath)) {
    fail(`Package "${packageName}" has no .claude-plugin/plugin.json.`);
    continue;
  }
  const manifest = readJson(manifestPath);
  const apm = YAML.parse(readFileSync(repositoryPath("packages", packageName, "apm.yml"), "utf8"));
  const portable = readJson(repositoryPath("packages", packageName, "plugin.json"));

  if (manifest.name !== packageName) {
    fail(`${packageName}: .claude-plugin/plugin.json name is "${manifest.name}".`);
  }
  for (const [label, version] of [["apm.yml", apm.version], ["plugin.json", portable.version]]) {
    if (manifest.version !== version) {
      fail(`${packageName}: Claude manifest version ${manifest.version} differs from ${label} version ${version}.`);
    }
  }

  // The shared skills a package installs through Claude plugin dependencies must be exactly the
  // subset its apm.yml pulls from this repository, or one install path gets a different lifecycle.
  const claudeSkills = [];
  for (const dependency of manifest.dependencies ?? []) {
    if (!skillsByPlugin.has(dependency)) {
      fail(`${packageName}: dependency "${dependency}" is not a skill plugin in the marketplace.`);
      continue;
    }
    claudeSkills.push(...skillsByPlugin.get(dependency));
  }
  const apmSkills = (apm.dependencies?.apm ?? [])
    .filter((dependency) => typeof dependency === "object" && dependency.git === "juangcarmona/agent-toolkit")
    .flatMap((dependency) => dependency.skills ?? []);
  if (JSON.stringify([...claudeSkills].sort()) !== JSON.stringify([...apmSkills].sort())) {
    fail(
      `${packageName}: Claude dependencies ship [${[...claudeSkills].sort()}] but apm.yml pulls [${[...apmSkills].sort()}].`,
    );
  }

  // Claude Code loads agents only from the plugin's own agents/ directory, and an agent's name must
  // be lowercase letters, digits and hyphens. A dotted name made the agent unreachable.
  const agentsRoot = repositoryPath("packages", packageName, "agents");
  if (existsSync(agentsRoot)) {
    for (const file of readdirSync(agentsRoot).filter((name) => name.endsWith(".md"))) {
      const data = frontmatter(repositoryPath("packages", packageName, "agents", file));
      const expected = basename(file, ".agent.md");
      if (!data?.name || !/^[a-z0-9-]+$/.test(data.name)) {
        fail(`${packageName}/agents/${file}: frontmatter name "${data?.name}" must match [a-z0-9-]+.`);
      } else if (data.name !== expected) {
        fail(`${packageName}/agents/${file}: frontmatter name "${data.name}" must equal "${expected}".`);
      }
      if (!data?.description) {
        fail(`${packageName}/agents/${file}: missing description.`);
      }
    }
  }
}

// When the Claude Code CLI is available, let it validate the manifests too. CI runners do not have
// it, so its absence is a note, not a failure.
function claudeAvailable() {
  try {
    return run("claude", ["--version"]).status === 0;
  } catch {
    // run() throws when the executable cannot be spawned at all, which is the CI case.
    return false;
  }
}

if (claudeAvailable()) {
  for (const target of [".", ...packageNames.map((name) => `packages/${name}`)]) {
    const result = run("claude", ["plugin", "validate", target]);
    if (result.status !== 0) {
      fail(`claude plugin validate ${target} failed:\n${result.stdout}${result.stderr}`);
    }
  }
} else {
  console.log("Claude Code CLI not found; skipped `claude plugin validate`.");
}

if (problems.length > 0) {
  console.error(problems.map((problem) => `- ${problem}`).join("\n"));
  process.exit(1);
}
console.log(`Claude Code marketplace is consistent with ${packageNames.length} package(s) and ${entries.length} plugin(s).`);
