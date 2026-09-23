# transition-work-item: GitHub Issues

The lifecycle state is not GitHub's `state`. It is a label or a Projects single-select field: resolve which during adoption.

## Labels

```bash
# Read the current state labels first and validate the transition
gh issue view <number> --json labels --jq '.labels[].name | select(startswith("status:"))'

# Only then apply the transition
gh issue edit <number> --remove-label "status:<from>" --add-label "status:<to>"
```

Read and validate the current state immediately before applying the label change. If the issue has moved, carries multiple state labels, or has no current lifecycle label, do not apply the transition: report the mismatch and stop. Applying a target label unconditionally can create a transition from an invalid state and leave downstream queries ambiguous. Remove the old state label in the same call. Two state labels on one issue makes every downstream query ambiguous, and nothing in GitHub prevents it.

## Projects single-select

```bash
gh project item-edit --id <item-id> --field-id <field-id> \
   --project-id <project-id> --single-select-option-id <option-id>
```

All four identifiers are per-project and are resolved during adoption.

## Closing

Closing an issue is a separate act from reaching a terminal lifecycle state. Do both only where the project's mapping says the terminal state means closed.
