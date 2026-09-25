---
name: enrich-us
description: "Trigger: enrich a user story, enrich a ticket, enrich a GitHub issue. Replace that issue body in this repository with the Original and the Enhanced ticket."
metadata:
  author: LIDR.co
  version: "2.0.0"
---

# enrich-us

Use the terms in [CONTEXT.md](CONTEXT.md).

## Activation

Load this skill when the user asks to enrich a user story, a pasted ticket, or a GitHub issue.

## Steps

1. Resolve the source. Accept an Issue only when `gh repo view --json nameWithOwner --jq .nameWithOwner` is `JuanSebastianGB/share-social-media` and the message has one issue number or one `github.com/JuanSebastianGB/share-social-media/issues/<n>` URL. Other text in that message is a constraint on the Enhanced ticket. No issue reference means the message is a Pasted ticket. Two issue references, another repository, or no ticket text: ask one question and stop.
   **Done when** the source is one Issue in that repository, or one Pasted ticket.

2. Read the source. For an Issue, run `gh issue view <n> --repo JuanSebastianGB/share-social-media --json number,title,body,state,url`. When the body already contains `## Original` and `## Enhanced`, the Original section is the source text. Otherwise the whole body is the source text. Read `docs/base-standards.md`, `docs/backend-standards.md`, `docs/frontend-standards.md`, `docs/documentation-standards.md`, `docs/data-model.md`, `docs/api-spec.yml`, and `docs/development_guide.md`. A missing file stops the run: tell the user to run project-context, and leave those files unchanged. Read the code the source names. Read `~/.config/opencode/skills/qa-expert/SKILL.md` and apply its decision tree.
   **Done when** the source text, those seven documents, and the relevant code have been read, or the run has stopped on a missing document.

3. Classify the source text. An Audit issue has all five headings: `### Lens`, `### Evidence`, `### Impact`, `### Cost`, and `### Risk`. Anything else is a User story.
   **Done when** one shape is chosen from those headings.

4. Draft the Enhanced ticket from the matching template below. Apply chat constraints. Keep the Original text verbatim. Write `Unknown` for a checklist item the source and the repository do not support. Record a Conflict only in the slot that template names.
   **Done when** every unsupported item is `Unknown` and each Conflict appears in that one slot.

5. Print `## Original` and `## Enhanced`. For a Pasted ticket, stop. For an Issue, write that same markdown to a temporary file outside the repository and run `gh issue edit <n> --repo JuanSebastianGB/share-social-media --body-file <file>` once, then delete the file. Pass no label, assignee, or state flags. Read the issue back.
   **Done when** the printed markdown matches the Issue body, or the reply says the body was not updated.

## User story

`## Enhanced` contains these sections:

- **Functionality** — what the change does.
- **Fields** — data the change reads or writes.
- **Endpoints** — method and path.
- **Files** — modules to change.
- **Definition of done** — points at Documentation and Testing.
- **Documentation** — paths of Context documents the implementation must change, or none. Paths only.
- **Testing** — authority `~/.config/opencode/skills/qa-expert`, the chosen type, the delegated skill, and the runner (`Jest` on the server, `Vitest` on the client). End-to-end names `e2e-agent`.
- **Non-functional requirements** — security, performance, observability.
- **Conflict** — the only copy of both claims, and the stale Context document. Omit this section when the sources agree.

## Audit issue

`## Enhanced` keeps these headings:

- **Lens** — the filed lens.
- **Evidence** — the only copy of both claims, and the stale Context document.
- **Impact** — what changes for users or operators.
- **Cost** — implementation effort, paths of Context documents to change, and the testing note (qa-expert type, delegated skill, runner). Paths only.
- **Risk** — what can break, including `Unknown` test types.
