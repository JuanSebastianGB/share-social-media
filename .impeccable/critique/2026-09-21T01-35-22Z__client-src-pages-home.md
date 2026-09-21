---
target: home
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/home/juancho/projects/aws/share-social-media/client/src/pages/Home"
timestamp: 2026-09-21T01-35-22Z
slug: client-src-pages-home
---
Method: dual-agent (A: 672ef802-45b1-417c-af49-b09e636264d7 · B: 9975c724-2c59-458e-afda-a51903c441ee)

# Critique: Home (`/home`) — post-P1 re-run

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Publish success silent; profile search no-ops without status |
| 2 | Match System / Real World | 3 | Media alt="idea"; own-post like disabled without copy |
| 3 | User Control and Freedom | 3 | Comment dismiss blocked while submit; Create Post still closable while Publishing |
| 4 | Consistency and Standards | 3 | Posts load failure is bare Typography, not ErrorContent |
| 5 | Error Prevention | 3 | Search on /:id silently ignored |
| 6 | Recognition Rather Than Recall | 3 | Theme/menu/search IconButtons weak labels |
| 7 | Flexibility and Efficiency | 2 | Search dead on Profile; no accelerators |
| 8 | Aesthetic and Minimalist Design | 3 | Empties fill voids; Comments date padding clumsy |
| 9 | Error Recovery | 3 | ErrorContent + Comments Retry landed; Posts load path still weak |
| 10 | Help and Documentation | 1 | Empty-state guidance only |
| **Total** | | **27/40** | **Acceptable** |

## Design Specificity Verdict

Utilitarian MUI shell with product-correct brand and authored empty/comment recovery. Still category-swappable compositionally — ember + paper personality, not a unique layout language.

**LLM:** P1 empties, CommentsModal, ErrorContent verified. Portfolio Visitor gets a real operable loop; not yet a memorable proof.

**Deterministic scan:** 2 advisories unchanged — AvatarWithTitles 13px, TitleAndSubtitle 0.5rem.

**Visual overlays:** Browser skipped — no mutation tools.

## Overall Impression

25 → 27 (+2). Empty states and Comments recovery earned the gains (H9, H10). One point shy of Good (28). Biggest blocker: silent Profile search.

## What's Working

1. Empty states (Posts + Friends panel) teach the next step.
2. CommentsModal is a real Operate surface (Send, loading, Retry, own posts).
3. ErrorContent sanitizes + Try again.

## Priority Issues

### [P1] Silent search on Profile
- **What:** `!id && dispatch(searchPosts)` — control looks live, does nothing.
- **Fix:** Disable + helper, or redirect to Home then search, or Alert.
- **Suggested command:** `/impeccable clarify home` or `/impeccable harden home`

### [P2] Posts load error under-recovers
- **What:** Bare Typography, no button; inconsistent with ErrorContent.
- **Suggested command:** `/impeccable harden home`

### [P2] No publish success beat
- **What:** Modal closes only.
- **Suggested command:** `/impeccable polish home` or `/impeccable delight home`

### [P2] Icon-only chrome gaps
- **What:** Theme/menu/search weak aria-labels.
- **Suggested command:** `/impeccable audit home` / `/impeccable clarify home`

### [P3] Polish leftovers
- alt="idea"; Comments date padding; Create Post closable while Publishing; detector 13px/0.5rem.
- **Suggested command:** `/impeccable polish home`

## Persona Red Flags

**Jordan:** Silent profile search; icon-only theme; own like disabled looks broken.
**Casey:** Search in overlay; publish success easy to miss.
**Portfolio Visitor:** Empties prove real app; silent search undercuts polished proof.

## Minor Observations

isOwn unused on CommentsModal; ListItemText name/body roles swapped; detector 2 font-size advisories remain.

## Cognitive Load / Emotional Journey

1/8 failures (low). Peaks on empties; valleys on silent search and silent publish success.

## Questions to Consider

1. If Search can’t run on Profile, why is the field still interactive?
2. What’s the success moment after Publish — and why withhold it?
3. Is Ember-on-paper enough, or is the layout still any MUI tutorial feed?
