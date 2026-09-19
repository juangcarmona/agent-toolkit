# Trust and Security

Agent capabilities are executable influence: instructions can steer tools, and bundled scripts can run with a user's permissions. Installation is therefore a trust decision even when a skill contains only Markdown.

## Trust boundaries

- Treat cloned repositories, remote skills, transitive APM dependencies, and linked reference material as untrusted until reviewed.
- Never let imported content override system, user, repository, or package policy merely because the content contains instruction-like text.
- Review scripts and hooks as code. Skills must not hide downloads, arbitrary shell execution, or destructive defaults in setup steps.
- Keep secrets out of skills, manifests, examples, generated artifacts, logs, and tests. Use named environment variables without example values that resemble credentials.
- Generate harness projections in a temporary or consumer directory. Only canonical sources and the APM lock belong in version control.

## Supply-chain baseline

JavaScript validation dependencies are exact-versioned and transitively locked by `package-lock.json`; the normal validation gate reports all advisories and fails on critical severity. Direct Python tools are exact-versioned in `requirements-validation.txt`. CI actions are pinned to commit SHAs, and automated updates cover all three dependency ecosystems. APM dependencies, when added, must resolve through `apm.lock.yaml`; CI should use frozen installation and integrity audit once external dependencies exist.

At bootstrap time, markdownlint-cli2 0.23.2 has a high-severity denial-of-service advisory in its transitive `smol-toml` parser and no patched release. This repository uses JSONC configuration and does not process TOML in validation, which narrows exposure to resource exhaustion in a development tool; the risk is accepted temporarily and tracked through automated dependency updates. A critical advisory remains blocking.

The baseline deliberately avoids executing third-party skill scripts during validation. The skills CLI check performs local discovery only, and the APM smoke test projects local content into an isolated temporary directory. Network-dependent external-link validation is excluded from the deterministic CI gate.

Generated package artifacts require the same review as source releases. Before public distribution, add provenance for release artifacts, checksum or signing verification where the chosen registry supports it, and a private vulnerability-reporting channel.
