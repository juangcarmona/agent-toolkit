import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");

export function repositoryPath(...parts) {
  return resolve(repositoryRoot, ...parts);
}

export function pythonTool(name) {
  const executable = process.platform === "win32" ? `${name}.exe` : name;
  const directory = process.platform === "win32" ? "Scripts" : "bin";
  const candidate = repositoryPath(".venv", directory, executable);
  return existsSync(candidate) ? candidate : name;
}

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });

  if (result.error) {
    throw new Error(`Unable to run ${command}: ${result.error.message}`);
  }

  return result;
}

export function requireSuccess(result, label) {
  if (result.status === 0) {
    return;
  }

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  throw new Error(`${label} failed with exit code ${result.status}.`);
}
