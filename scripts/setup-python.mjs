import { existsSync } from "node:fs";
import { repositoryPath, requireSuccess, run } from "./tooling.mjs";

const venvDirectory = repositoryPath(".venv");
const bootstrapPython = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");

if (!existsSync(venvDirectory)) {
  const create = run(bootstrapPython, ["-m", "venv", venvDirectory]);
  requireSuccess(create, "Python virtual environment creation");
}

const venvPython = repositoryPath(
  ".venv",
  process.platform === "win32" ? "Scripts" : "bin",
  process.platform === "win32" ? "python.exe" : "python",
);
const install = run(venvPython, [
  "-m",
  "pip",
  "install",
  "--disable-pip-version-check",
  "-r",
  repositoryPath("requirements-validation.txt"),
], { stdio: "inherit" });
requireSuccess(install, "Python validation dependency installation");

console.log("Python validation tools are ready in .venv.");
