import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import YAML from "yaml";
import { repositoryPath, requireSuccess, run } from "./tooling.mjs";

const expectedNames = readdirSync(repositoryPath("skills"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const content = readFileSync(repositoryPath("skills", entry.name, "SKILL.md"), "utf8");
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return YAML.parse(frontmatter[1]).name;
  });

const cli = repositoryPath("node_modules", "skills", "bin", "cli.mjs");
const result = run(process.execPath, [cli, "add", ".", "--list"], {
  env: {
    ...process.env,
    DISABLE_TELEMETRY: "1",
    NO_COLOR: "1",
  },
});
requireSuccess(result, "skills CLI discovery");

const output = `${result.stdout}\n${result.stderr}`;
for (const name of expectedNames) {
  if (!output.includes(name)) {
    throw new Error(`skills CLI did not discover expected skill: ${name}`);
  }
}

process.stdout.write(result.stdout);

const scratch = mkdtempSync(join(tmpdir(), "agent-toolkit-skills-"));
try {
  const consumer = join(scratch, "consumer");
  mkdirSync(consumer);
  const install = run(process.execPath, [
    cli,
    "add",
    repositoryPath(),
    "--skill",
    "agent-skill-authoring",
    "--agent",
    "codex",
    "--copy",
    "--yes",
  ], {
    cwd: consumer,
    env: {
      ...process.env,
      DISABLE_TELEMETRY: "1",
      NO_COLOR: "1",
    },
  });
  requireSuccess(install, "skills CLI installation");

  const source = readFileSync(repositoryPath("skills", "agent-skill-authoring", "SKILL.md"), "utf8");
  const installed = readFileSync(join(consumer, ".agents", "skills", "agent-skill-authoring", "SKILL.md"), "utf8");
  if (source !== installed) {
    throw new Error("skills CLI installation differs from the canonical source.");
  }

  const lock = JSON.parse(readFileSync(join(consumer, "skills-lock.json"), "utf8"));
  if (!JSON.stringify(lock).includes("agent-skill-authoring")) {
    throw new Error("skills CLI lock does not record the installed skill.");
  }

  const allConsumer = join(scratch, "all-consumer");
  mkdirSync(allConsumer);
  const installAll = run(process.execPath, [
    cli,
    "add",
    repositoryPath(),
    "--skill",
    "*",
    "--agent",
    "codex",
    "--copy",
    "--yes",
  ], {
    cwd: allConsumer,
    env: {
      ...process.env,
      DISABLE_TELEMETRY: "1",
      NO_COLOR: "1",
    },
  });
  requireSuccess(installAll, "skills CLI whole-collection installation");
  const installedAll = readFileSync(join(allConsumer, ".agents", "skills", "agent-skill-authoring", "SKILL.md"), "utf8");
  if (source !== installedAll) {
    throw new Error("skills CLI whole-collection installation differs from the canonical source.");
  }
} finally {
  rmSync(scratch, { recursive: true, force: true, maxRetries: 3 });
}

console.log(`skills CLI discovered ${expectedNames.length} canonical skill(s), installed one selected skill with provenance lock data, and installed the complete collection.`);
