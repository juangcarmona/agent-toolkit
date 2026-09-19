# Local Precedent Review

This review records engineering patterns observed in local company and application repositories without reproducing proprietary content, names, rules, or skill text.

## Useful patterns

- A local company skills repository layers an upstream Agent Skills validator, organization-specific structural checks, root-license checks, and a separate security scanner. This supports the architecture used here: upstream conformance first, repository invariants second, supply-chain checks as a distinct concern.
- Its CI scopes some expensive checks to changed capabilities and keeps reproduction commands visible in failure output. This is worth revisiting when this catalog becomes large; a full deterministic pass is simpler and more trustworthy for the bootstrap.
- Local application repositories use markdownlint-cli2's custom-rule extension point to encode a one-paragraph-per-line convention while disabling arbitrary line-length wrapping. This validates the extension architecture chosen here.

## Deliberately not adopted

- Company naming conventions, plugin categories, ownership rules, and harness-specific manifests are not portable and were not copied.
- Proprietary skill instructions, templates, scripts, validators, and security policy text were not copied or adapted.
- The custom Markdown rule in this repository is an original, minimal implementation against markdownlint's public rule API; it expresses only this repository's documented prose convention.
- The local plugin-first repository shape solves an organizational marketplace problem and is not evidence that a public, vendor-neutral toolkit should use the same source layout.

The local review influenced validation layering and extension points, not public content or repository identity.
