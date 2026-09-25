# Pull requests

One pull request targets `main`. How it names a GitHub issue depends on whether a ticket exists.

## When an issue exists

The issue is the ticket. Open one pull request to `main` for that issue.

Put a closing keyword in the pull request description:

```markdown
Closes #96
```

Accepted keywords are `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves`, and `resolved`, followed by `#<number>`. GitHub links that pull request to the issue. Merging the pull request into `main` closes the issue.

GitHub reads those keywords only when the pull request targets the default branch. A pull request aimed at any other branch does not link the issue and does not close it on merge.

A pull request that mentions the issue without a closing keyword stays linked only as text. Use that form when the pull request does not finish the ticket. The pull request that finishes the ticket is the one that carries `Closes #<number>`.

## When no issue exists

Open one pull request to `main`. Include a summary and a test plan. Leave out a closing keyword.

That is how this repository opened pull requests #91 through #95.

## Description

```markdown
Closes #<number>

## Summary

<What the pull request changes and why.>

## Test plan

- [ ] <Command or check, with the result>
```

Omit the `Closes` line when there is no issue.
