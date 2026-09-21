---
target: home
total_score: 14
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:/home/juancho/projects/aws/share-social-media/client/src/pages/Home"
timestamp: 2026-09-21T01-14-19Z
slug: client-src-pages-home
closed: true
---
Method: dual-agent (A: a867a6e8-ebe8-4655-bd10-278dc0a0b90a · B: 44a3281e-0ea0-4f44-8602-ee79e868f70f)

# Critique: Home (`/home`) — Operate / The Signed-In Proof

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | Post submit hides Publish with no spinner; like/friend/comment failures only console.log; Posts error dumps JSON.stringify |
| 2 | Match System / Real World | 1 | Clone idioms (“What is in your mind”); fake Trends (“100k shares”); brand mark ≠ product name |
| 3 | User Control and Freedom | 2 | Modal close exists; friend remove has no undo/confirm; Share is dead; logout buried in Select |
| 4 | Consistency and Standards | 2 | Theme mostly consistent; Scroll/ErrorContent off-palette; Publish is text not primary filled |
| 5 | Error Prevention | 1 | One-tap PersonRemove; weak visible field errors on compose |
| 6 | Recognition Rather Than Recall | 3 | Feed/composer/friends recognizable social patterns |
| 7 | Flexibility and Efficiency | 2 | Infinite scroll + scroll-to-top; search disabled silently on profile; no keyboard-forward compose |
| 8 | Aesthetic and Minimalist Design | 1 | Three rails + fake Trends + dead nav icons + vanity metrics fight feed scan |
| 9 | Error Recovery | 1 | ErrorContent red brick with API strings; Friends empty “Not friends Found”; no recovery CTA |
| 10 | Help and Documentation | 0 | Help icon is non-interactive decoration |
| **Total** | | **14/40** | **Poor** |

## Design Specificity Verdict

**Start here.** Mostly category-interchangeable: token-matches The Signed-In Proof (Ember on Cool Paper / Soft Canvas, Rubik stack, flat feed) but fails product character where Operate and portfolio proof matter.

**LLM assessment:** Coherent paper-on-canvas cards, no landing-page dress-up. Same as tutorial clones: Facebook placeholder copy, vanity impressions, hardcoded Trends, dead Message/Help/Notifications/Share chrome, brand mark `S. Social M.` instead of Share Social Media / S.S.Media. Portfolio visitors cannot tell this from a Sociopedia-style clone with a redder primary.

**Deterministic scan:** 22 advisory findings (exit 0). 16× design-system-font-size (18px/25px/15px/13px/0.5rem/2.25rem off ramp), 5× design-system-radius (15px, 0.5rem, 0.25rem), 1× design-system-color (`Scroll.tsx` `#397ba6`). No overused-font on this target set. Detector agrees with off-brand Scroll color; does not catch fake Trends, dead chrome, mobile column-reverse, or wrong brand string — those are LLM-only.

**Visual overlays:** Browser visualization skipped — no page-mutation tools in Assessment B; client not on :5173. No user-visible overlay.

## Overall Impression

The signed-in spine is real (compose → feed → like/comment), and the tokens honor the North Star — then dead icons, fake Trends, wrong wordmark, and a mobile layout that buries the feed burn the “Signed-In Proof” claim. Biggest opportunity: strip theatrical chrome and put the feed first so honesty matches the AWS stack story.

## What's Working

1. **Token-level North Star is real** — Ember / Cool Paper / Soft Canvas / Rubik wired as documented; feed cards read utilitarian, not marketing.
2. **Feed Operate spine exists** — AddPost → Posts infinite scroll → Post like/comment is a coherent primary loop when content loads.
3. **No SaaS-dashboard cosplay** — three-column social shell is honest to a social app (aside from vanity UserInfo rows and fake Trends).

## Priority Issues

### [P0] Mobile feed buried
- **What:** `Homelayout.tsx` uses `flexDirection: 'column-reverse'` below `md`, so Trends/Friends/UserInfo render above AddPost/Posts.
- **Why it matters:** Distracted mobile users cannot scan the feed; first viewport is side rails. Operate fails.
- **Fix:** Column-normal order; feed first; collapse Friends into a sheet; keep Trends hidden on mobile.
- **Suggested command:** `/impeccable adapt home`

### [P0] Fake / dead chrome kills credibility
- **What:** Hardcoded Trends; Message/Help/Notifications icons with no handlers; Share IconButton with no onClick.
- **Why it matters:** Portfolio visitors read “tutorial shell”; first-timers learn helplessness.
- **Fix:** Remove Trends until real data (or label Sample); strip or disable non-shipped icons; wire Share or delete it.
- **Suggested command:** `/impeccable distill home`

### [P1] Wrong brand mark
- **What:** NavbarLeft wordmark is `S. Social M.` in primary.dark.
- **Why it matters:** Brief requires Share Social Media / S.S.Media.
- **Fix:** `S.S.Media` short mark + accessible full name; keep ember scarce.
- **Suggested command:** `/impeccable clarify home`

### [P1] Destructive friend actions without friction
- **What:** PersonRemove one-tap on Friends and PostSection; errors only logged.
- **Why it matters:** Accidental unfriend; no status; high-stakes Operate without reassurance.
- **Fix:** Confirm dialog; toast on success/fail; disable while pending.
- **Suggested command:** `/impeccable harden home`

### [P2] Compose completion UX
- **What:** Publish is text-variant; button unmounts on submit; catch restores button with no message; placeholder “What is in your mind…”.
- **Why it matters:** Peak-end of “I posted” is weak or anxious.
- **Fix:** Contained primary Ember button; loading on button; inline error; success close + snackbar; copy “What’s on your mind, {name}?”
- **Suggested command:** `/impeccable polish home`

### [P3] Off-brand / harsh failure surfaces
- **What:** Scroll hardcoded greys/blue `#397ba6`; ErrorContent raw `#f44336`; Posts shows raw JSON; detector confirms token drift (font sizes, radii).
- **Why it matters:** Breaks Paper-on-Canvas + One Ember Rule; scares Operate users.
- **Fix:** Theme tokens only; human error + retry; never stringify errors into the feed; align icon sizes/radii to DESIGN.md ramp.
- **Suggested command:** `/impeccable polish home`

## Persona Red Flags

**Jordan (First-Timer):** Wrong brand; Facebook clone prompts; dead Help/Message; no empty-feed guidance; error walls in red/JSON — “am I in a real product?”

**Casey (Distracted Mobile):** Feed under side content; hamburger opens mostly-dead icons; large minHeight images; one-tap unfriend while thumb-scanning.

**Portfolio Visitor (AWS/fullstack credibility):** Hardcoded Trends + vanity impressions scream template; dead nav icons and JSON errors undercut the real Dynamo/Cognito story the signed-in proof should sell.

## Minor Observations

- UserInfo title is firstName only; avatar alt="profile" is generic.
- CommentsModal: ImageIcon avatars, submit as TextField type=submit value="send"; own posts can’t comment with no explanation.
- Scroll initializes show true; aria-label="up" only.
- Navbar Select uses user.name vs user.email inconsistently desktop vs mobile.
- AvatarWithTitles profile links use replace={true} — odd history.
- Detector: 16 off-ramp font sizes, 5 off-scale radii across Navbar/Posts/Friends/UserInfo.

## Cognitive Load

6/8 checklist failures (high). Decision points >4 options: NavbarRight (5+), mobile NavbarMenu (6).

## Emotional Journey

Intended peak is first real post card. Valleys: mobile side-rails-first, fake Trends, dead icons, silent publish failure, “Not friends Found”. High-stakes reassurance absent for unfriend and publish failure.

## Questions to Consider

1. If you deleted Trends, Message, Help, Notifications, Share, and impressions rows tomorrow, would Home feel more or less like a finished AWS product?
2. Why is the mobile first screen allowed to show friends before the feed when Operate’s job is “scan posts”?
3. Is `S. Social M.` a deliberate short mark, or evidence nobody owned the brand string in the signed-in shell?
4. Would you demo this Home to a hiring manager with Trends still saying “House of dragon — 30k shares”?
