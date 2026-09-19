import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

  const source = readFileSync(repositoryPath("skills", "agent-skill-authoring", "SKILL.md"), "utf8");
  const projection = readFileSync(join(consumer, ".agents", "skills", "agent-skill-authoring", "SKILL.md"), "utf8");
  if (source !== projection) {
    throw new Error("APM projection differs from the canonical skill source.");
  }

  const audit = run(apm, ["audit", "--ci"], {
    env: { ...process.env, APM_DISABLE_UPDATE_CHECK: "1" },
  });
  requireSuccess(audit, "APM integrity and policy audit");
  process.stdout.write(audit.stdout);

  console.log("APM pack and shared skill projection smoke tests passed.");
} finally {
  rmSync(scratch, { recursive: true, force: true, maxRetries: 3 });
}
