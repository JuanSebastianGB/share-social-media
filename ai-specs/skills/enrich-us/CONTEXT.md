# Enrich user stories

Vocabulary for the enrich-us skill: the work item being enriched, and the two shapes that work item can have.

## Language

**Issue**:
A GitHub issue in this repository. The remote work item the skill reads and enriches.
_Avoid_: Ticket, Jira issue, story

**Pasted ticket**:
Ticket text supplied in the conversation, with no Issue behind it.
_Avoid_: Issue

**Audit issue**:
An Issue whose content follows the improvement audit: lens, evidence, impact, cost, and risk.
_Avoid_: User story

**User story**:
An Issue or Pasted ticket that is not an Audit issue.
_Avoid_: Audit issue, ticket

**Original**:
The pre-enrichment text of an Issue or Pasted ticket, kept beside the Enhanced ticket.
_Avoid_: the Issue body after enrichment

**Context document**:
A standards or contract document from this repository's project-context set.
_Avoid_: @documentation

**Conflict**:
A disagreement between the Issue text, a Context document, and the code. Both claims stay visible, and neither is treated as fact.
_Avoid_: winner, source of truth

**Enhanced ticket**:
The enriched form of a User story or an Audit issue, kept beside the Original. An Audit issue stays audit-shaped. A User story is the implementation-ready story.
_Avoid_: Original
