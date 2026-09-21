---
name: Share Social Media
description: Utilitarian MUI social shell — the signed-in proof of a real AWS stack.
colors:
  ember-vermillion: "#dc2f02"
  ember-light: "#faa307"
  ember-deep: "#370617"
  cool-paper: "#f8f9fa"
  soft-canvas: "#e9ecef"
  neutral-ink: "#343a40"
  neutral-muted: "#6c757d"
  neutral-line: "#ced4da"
  error-signal: "#d32f2f"
  dark-canvas: "#495057"
  dark-paper: "#212529"
typography:
  body:
    fontFamily: "Montserrat, Rubik, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  title:
    fontFamily: "Rubik, Montserrat, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  headline:
    fontFamily: "Rubik, Montserrat, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  label:
    fontFamily: "Rubik, Montserrat, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "5px"
  md: "7px"
  lg: "10px"
spacing:
  xs: "0.3rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.ember-vermillion}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ember-deep}"
    textColor: "#ffffff"
  card-surface:
    backgroundColor: "{colors.cool-paper}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  input-field:
    backgroundColor: "{colors.cool-paper}"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.lg}"
  navbar-bar:
    backgroundColor: "{colors.cool-paper}"
    rounded: "{rounded.sm}"
    padding: "0.2rem"
  auth-sheet:
    backgroundColor: "{colors.cool-paper}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
---

# Design System: Share Social Media

## Overview

**Creative North Star: "The Signed-In Proof"**

This system documents the incumbent client UI: a utilitarian, dense, functional MUI social shell. Personality comes from a warm vermillion accent on cool grey paper panels, not from decorative chrome. The aesthetic philosophy is straightforward: prioritize the signed-in social loop (auth → feed → profile → friends → media) so portfolio visitors and friends experience a real product, not a marketing façade.

Confirmed visual anti-reference: do not dress surfaces as a marketing landing page or a fake SaaS dashboard. Keep the look honest to an operable social app.

**Key Characteristics:**
- Warm ember accent on cool neutral paper/canvas layers
- Rubik + Montserrat sans pairing via MUI typography variants
- Softly rounded paper panels (~10px) stacked on a grey canvas
- Tonal depth first; Material elevation reserved for auth sheets
- Light/dark palette modes wired through the same token roles

## Colors

A single warm accent voice on a cool Bootstrap-flavored grey scale; light mode is the documented default, with dark-mode role remaps already implemented in theme code.

### Primary
- **Ember Vermillion** (`#dc2f02`): Primary actions, section titles (`h5`/`h6`), liked-state icons, brand header emphasis. Scarcity matters — it should read as signal, not wallpaper.
- **Ember Light** (`#faa307`): Lighter primary role (links on auth sheets use `primary.light`).
- **Ember Deep** (`#370617`): Dark primary role for emphasis and dark-mode contrast anchors.

### Neutral
- **Cool Paper** (`#f8f9fa`): Raised content surfaces — posts, profile cards, friends lists, navbar, auth paper.
- **Soft Canvas** (`#e9ecef`): Page background behind panels; also the recessed input well inside Add Post.
- **Neutral Ink** (`#343a40`): Primary body/caption ink on light surfaces.
- **Neutral Muted** (`#6c757d`): Secondary captions and meta counts.
- **Neutral Line** (`#ced4da`): Dividers and dropzone borders at rest.
- **Error Signal** (`#d32f2f`): Validation and missing-file errors (MUI error red, used as-is).

### Dark mode surfaces (role remap)
- **Dark Canvas** (`#495057`) / **Dark Paper** (`#212529`): Background and paper when `mode === 'dark'`. Primary main shifts to `#e85d04` in dark mode.

### Named Rules
**The One Ember Rule.** Ember Vermillion is for action and hierarchy highlights only — never flood large backgrounds with the primary ramp.

**The Paper-on-Canvas Rule.** Content lives on Cool Paper; the page reads Soft Canvas. Do not invert that relationship casually.

## Typography

**Display Font:** Rubik (with Montserrat, sans-serif)
**Body Font:** Montserrat (with Rubik, sans-serif) — `body` CSS sets Montserrat; MUI theme stack leads with Rubik
**Label/Mono Font:** same sans stack (no distinct mono)

**Character:** Clean geometric sans pairing — Rubik for UI chrome and titles, Montserrat as the body fallback. Straightforward and readable, not editorial.

### Hierarchy
- **Headline** (700, ~1.5rem / MUI `h5`): Auth header brand line, friends section titles.
- **Title** (700, ~1.25rem / MUI `h6`): Profile name and panel headings in primary color.
- **Body** (400, 1rem / MUI `body1`): Form helper text and general copy.
- **Label** (400, ~0.75rem / MUI `caption`/`subtitle2`): Meta rows, counts, muted actions.

### Named Rules
**The Variant Honesty Rule.** Prefer MUI typography variants (`h5`, `h6`, `caption`, `subtitle2`) over one-off pixel sizes so density stays consistent across feed and profile.

## Layout

Three-column home on desktop (`flex` sections ~1 / 0.6 / 0.4) collapsing to a single column below ~900px. Auth forms center as a paper sheet (~50% width desktop, ~93% below ~800px) with internal CSS grid (register: 4 columns, full-span on mobile). Profile mirrors the home flex pattern with user/friends beside posts. Rhythm is rem-based (`0.5rem`–`2rem`) with occasional `10px`/`12px` gaps between stacked cards. Max content width sits near 90–95% of the viewport with auto margins.

### Named Rules
**The Feed-First Column Rule.** On desktop, the posts column is the widest flex share; side panels never overpower the feed.

## Elevation & Depth

Tonal first: most surfaces are flat Cool Paper panels distinguished from Soft Canvas by fill, not shadow. Auth login/register sheets use MUI `Paper` with elevation (`elevation={7}` on register) as the exception — structural lift for the signed-out entry ritual.

### Shadow Vocabulary
- **Auth sheet lift** (MUI Paper elevation 7): Login and register only.
- **Feed cards:** no custom `box-shadow`; depth = paper fill + `10px` radius + spacing.

### Named Rules
**The Flat Feed Rule.** Feed and profile cards stay flat at rest. Do not add decorative card shadows to match the auth sheet.

## Shapes

Gently rounded rectangles dominate: ~`10px` for cards, avatars wells, dropzones, and media; ~`7px` for the add-post shell; ~`5px` for the navbar bar. Borders are thin solid Neutral Line (or Error Signal on invalid dropzones). No hard geometric clipping language beyond circular avatars.

### Named Rules
**The Soft Panel Rule.** Prefer ~`10px` radius for content panels; reserve sharper ~`5px` for chrome like the navbar.

## Components

Straightforward and utilitarian — MUI primitives with light local styling, not a bespoke component language.

### Buttons
- **Shape:** MUI default contained radius (treat as soft, near `{rounded.md}`)
- **Primary:** `variant="contained"` `color="primary"` — Ember Vermillion fill, white label; full-width in auth grids
- **Hover / Focus:** MUI primary darkening / focus ring; do not invent custom glow
- **Icon actions:** 18px MUI icons in `IconButton` for like, comment, share, remove-friend

### Cards / Containers
- **Corner Style:** gently curved (~`10px`)
- **Background:** Cool Paper on Soft Canvas
- **Shadow Strategy:** none on feed cards; auth uses Paper elevation
- **Border:** usually none; dropzone uses thin Neutral Line
- **Internal Padding:** ~`1rem` typical; user info ~`0.7rem`

### Inputs / Fields
- **Style:** MUI `TextField` / `InputBase`; Add Post composer uses Soft Canvas fill and `10px` radius
- **Focus:** MUI default focus behavior
- **Error / Disabled:** Error Signal text and borders; helper text via Formik + MUI

### Navigation
- Cool Paper bar, slight `5px` radius, space-between left brand/search and right actions
- Mobile (<900px): menu toggle + overlay menu; scroll-to-top control after ~250px scroll
- Signed-out Header: centered uppercase title on Cool Paper, Ember Deep text

### Dropzone (signature)
- Paper panel, `10px` radius, dashed-feel via thin border, centered icon + “Add profile Photo / Or Drag”
- Error state swaps border and copy to Error Signal

## Do's and Don'ts

### Do:
- **Do** keep Ember Vermillion scarce — actions, titles, liked state.
- **Do** stack Cool Paper panels on Soft Canvas with ~`10px` radius and ~`1rem` padding.
- **Do** use MUI typography variants and the Rubik/Montserrat stack already loaded.
- **Do** collapse multi-column layouts near 900px (feed) and 800px (auth).

### Don't:
- **Don't** restyle the product as a marketing landing page or fake SaaS dashboard.
- **Don't** flood backgrounds with the primary ramp or invent a second accent family.
- **Don't** add decorative shadows to feed/profile cards to “match” auth elevation.
- **Don't** use the header copy “social media share” — brand is Share Social Media / S.S.Media.
