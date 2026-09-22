import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { pythonTool, repositoryPath, requireSuccess, run } from "./tooling.mjs";

const scratch = mkdtempSync(join(tmpdir(), "agent-toolkit-apm-"));
const apm = pythonTool("apm");

try {
  const pack = run(apm, ["pack", "--format", "agent-plugin", "--dry-run", "--offline", "--output", join(scratch, "bundle")], {
    env: { ...process.env, APM_DISABLE_UPDATE_CHECK: "1" },
  });
  if (pack.error?.code === "ENOENT") {
    throw new Error("apm is unavailable. Run npm run setup:validation first.");
  }
  requireSuccess(pack, "APM package dry run");
  process.stdout.write(pack.stdout);

  const bundleOutput = join(scratch, "bundle");
  const build = run(apm, ["pack", "--format", "agent-plugin", "--offline", "--output", bundleOutput], {
    env: { ...process.env, APM_DISABLE_UPDATE_CHECK: "1" },
  });
  requireSuccess(build, "APM package build");
  process.stdout.write(build.stdout);

  const compatibilityOutput = join(scratch, "compatibility-bundle");
  const compatibilityBuild = run(apm, ["pack", "--format", "plugin", "--offline", "--output", compatibilityOutput], {
    env: { ...process.env, APM_DISABLE_UPDATE_CHECK: "1" },
  });
  requireSuccess(compatibilityBuild, "APM compatibility package build");
  process.stdout.write(compatibilityBuild.stdout);

  const consumer = join(scratch, "consumer");
  mkdirSync(consumer);
  const compatibilityBundle = join(compatibilityOutput, "agent-toolkit-0.1.0");
  const install = run(apm, [
    "install",
    compatibilityBundle,
    "--target",
    "copilot",
  ], {
    cwd: consumer,
    env: { ...process.env, APM_DISABLE_UPDATE_CHECK: "1" },
  });
  requireSuccess(install, "APM compatibility bundle installation smoke test");
  process.stdout.write(install.stdout);

  const skillNames = readdirSync(repositoryPath("skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const skillName of skillNames) {
    const source = readFileSync(repositoryPath("skills", skillName, "SKILL.md"), "utf8");
    const projection = readFileSync(join(consumer, ".agents", "skills", skillName, "SKILL.md"), "utf8");
    if (source !== projection) {
      throw new Error(`APM projection differs from the canonical skill source: ${skillName}`);
    }
  }

  const packageNames = readdirSync(repositoryPath("packages"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const packageName of packageNames) {
    const pluginConsumer = join(scratch, `plugin-consumer-${packageName}`);
    mkdirSync(pluginConsumer);
    // A UTF-8 BOM is written deliberately: APM 0.31.0 silently deploys only directory
    // stubs for local-path dependencies when the consumer manifest lacks one. Remove
    // this workaround once the upstream behavior is fixed.
    const bom = "\uFEFF";
    writeFileSync(join(pluginConsumer, "apm.yml"), bom + [
      "name: plugin-consumer",
      "version: 1.0.0",
      "dependencies:",
      "  apm:",
      `    - path: ${repositoryPath("packages", packageName).split(sep).join("/")}`,
      "",
    ].join("\n"));
    // APM 0.31.0's Windows pip-launcher exe silently skips file deployment for
    // local-path dependencies when spawned directly from Node (directory stubs only).
    // Invoking it through PowerShell restores full deployment on Windows; on Linux the
    // launcher is a plain script and direct spawn works. Revisit when APM's launcher changes.
    const isWindows = process.platform === "win32";
    const pluginInstall = isWindows
      ? run(
          "powershell.exe",
          ["-NoProfile", "-Command", `& '${apm.replace(/'/g, "''")}' install --target copilot`],
          {
            cwd: pluginConsumer,
            env: { ...process.env, APM_DISABLE_UPDATE_CHECK: "1" },
          },
        )
      : run(apm, ["install", "--target", "copilot"], {
          cwd: pluginConsumer,
          env: { ...process.env, APM_DISABLE_UPDATE_CHECK: "1" },
        });
    requireSuccess(pluginInstall, `${packageName} plugin package installation smoke test`);
    process.stdout.write(pluginInstall.stdout);

    const packageSkillsRoot = repositoryPath("packages", packageName, "skills");
    const pluginSkillNames = existsSync(packageSkillsRoot)
      ? readdirSync(packageSkillsRoot, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
          .sort()
      : [];
    for (const skillName of pluginSkillNames) {
      const source = readFileSync(join(packageSkillsRoot, skillName, "SKILL.md"), "utf8");
      const projection = readFileSync(join(pluginConsumer, ".agents", "skills", skillName, "SKILL.md"), "utf8");
      if (source !== projection) {
        throw new Error(`${packageName} plugin projection differs from the canonical skill source: ${skillName}`);
      }
    }

    // Each package's apm.yml may request shared skills from this repository's published
    // remote through its git dependency. Those resolve only after the skills are pushed,
    // so this check verifies them when the remote carries them and records a reminder otherwise.
    const manifest = readFileSync(repositoryPath("packages", packageName, "apm.yml"), "utf8");
    const sharedMatch = manifest.match(/skills:\s*\[([^\]]*)\]/);
    const sharedSkillNames = sharedMatch ? sharedMatch[1].split(",").map((s) => s.trim()).filter(Boolean) : [];
    const missingSharedSkills = sharedSkillNames.filter(
      (skillName) => !existsSync(join(pluginConsumer, ".agents", "skills", skillName, "SKILL.md")),
    );
    if (missingSharedSkills.length === sharedSkillNames.length && sharedSkillNames.length > 0) {
      console.log(`Note: ${packageName}'s shared skills (${sharedSkillNames.join(", ")}) are not yet on the published remote; push this repository to activate the dependency.`);
    } else if (missingSharedSkills.length > 0) {
      throw new Error(`${packageName} shared-skill dependency resolved only partially; missing on remote: ${missingSharedSkills.join(", ")}`);
    } else {
      for (const skillName of sharedSkillNames) {
        const source = readFileSync(repositoryPath("skills", skillName, "SKILL.md"), "utf8");
        const projection = readFileSync(join(pluginConsumer, ".agents", "skills", skillName, "SKILL.md"), "utf8");
        if (source !== projection) {
          throw new Error(`${packageName} shared-skill projection differs from the canonical skill source: ${skillName}`);
        }
      }
    }
  }

  const audit = run(apm, ["audit", "--ci"], {
    env: { ...process.env, APM_DISABLE_UPDATE_CHECK: "1" },
  });
  requireSuccess(audit, "APM integrity and policy audit");
  process.stdout.write(audit.stdout);

  console.log("APM pack, shared skill projection, and plugin package smoke tests passed.");
} finally {
  rmSync(scratch, { recursive: true, force: true, maxRetries: 3 });
}
