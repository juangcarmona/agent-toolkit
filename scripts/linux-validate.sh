#!/usr/bin/env bash
# Linux validation harness: runs the repository's full validation gate on Linux (WSL).
# Usage: bash scripts/linux-validate.sh (from anywhere, inside WSL)
# Requires: .venv-linux with requirements-validation.txt installed, node_modules via npm ci.
set -u
cd "$(dirname "$0")/.."
export PATH="$PWD/.venv-linux/bin:$PATH"
export APM_DISABLE_UPDATE_CHECK=1

echo "=== node/python ==="
node --version
.venv-linux/bin/python --version

echo "=== lint:markdown ==="
npx markdownlint-cli2 || exit 1

echo "=== validate:skills ==="
node scripts/validate-skills.mjs || exit 1

echo "=== validate:links ==="
node scripts/validate-links.mjs || exit 1

echo "=== validate:packages ==="
node scripts/validate-package.mjs || exit 1

echo "=== ALL LINUX CHECKS PASSED ==="
