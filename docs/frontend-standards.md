---
description: Frontend development standards, best practices, and conventions for the Share Social Media Vite + React + TypeScript SPA, including component patterns, state management, UI/UX guidelines, and testing practices
globs: client/**/*.{ts,tsx,css}
alwaysApply: true
---

# Frontend Project Configuration and Best Practices

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [UI/UX Standards](#uiux-standards)
- [Testing Standards](#testing-standards)
- [Configuration Standards](#configuration-standards)
- [Performance Best Practices](#performance-best-practices)
- [Development Workflow](#development-workflow)
- [Legacy and Known Debt](#legacy-and-known-debt)

## Overview

The Share Social Media client is a React 18 single-page application built with Vite and TypeScript. It talks to the Express API via Axios (`Api` for multipart, `ApiJson` for JSON) using `VITE_APP_BASE_URL`. Auth is dual-mode: local register/login against `/auth/*` when Cognito Vite env is unset, or AWS Cognito Identity Provider SDK + `POST /auth/profile` when `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, and `VITE_AWS_REGION` are all set.

UI is Material UI (MUI) 5 with a custom theme from `client/src/utilities/themeConfig.ts` (`makeTheme`). Global client state is a Redux Toolkit store with **redux-persist**: session-only `auth` (`user`, `token`), plus focused `posts`, `friends`, and `theme` slices.

Contract of record for API shapes: [`docs/api-spec.yml`](./api-spec.yml). Align adapters and models with that file and with hydrated post/user responses from the server.

## Technology Stack

### Core Technologies

| Concern | Choice | Version / notes |
|---------|--------|-----------------|
| UI library | React | 18.3.x |
| Language | TypeScript | 5.9.x (workspace pins may float in lockfile) |
| Bundler | Vite | 5.4.x |
| Router | react-router-dom | 6.30.x — `BrowserRouter` in `App.tsx` |
| HTTP | axios | Interceptors in `client/src/interceptors/axios.interceptor.tsx` |
| Package manager | pnpm workspace | Root lockfile only |

### UI Framework

| Concern | Choice | Notes |
|---------|--------|-------|
| Component library | MUI 5.18.x | `@mui/material` + `@mui/icons-material` |
| Styling | MUI `sx` + Emotion + styled-components helpers | `client/src/styled-components/` |
| Theme | `makeTheme(mode)` | Light/dark via `theme.mode`; Rubik/Montserrat fonts |
| Toasts | react-toastify | Mounted in `App.tsx` |
| Dropzone | react-dropzone | Posts and register avatar flows |

**Source of truth for colors/typography:** `client/src/utilities/themeConfig.ts`. Prefer `theme.palette.primary|neutral|background` over hardcoded hex in new UI (some legacy hex remains in dropzone borders).

### State Management & Data Flow

| Kind | Tool | Rule |
|------|------|------|
| Auth session | Redux Toolkit `authSlice` + redux-persist | `user`, `token` only |
| Feed UI | `postsSlice` | Posts list, page, search |
| Friends list | `friendsSlice` | Session friends |
| Theme | `themeSlice` | Color mode (`light` / `dark`) |
| Local UI state | React `useState` / `useRef` | Modals, form draft fields, observers |
| Server fetch | Service functions + hooks (`usePosts`, `useFriends`, `useUser`, …) | Call Axios services; dispatch into the matching slice |

`userSlice.ts` exists under `redux/states/` but is **unwired** from the store — do not assume it is active.

### Testing Framework

| Concern | Reality |
|---------|---------|
| Runner | **Vitest** + **jsdom** + **Testing Library** (`@testing-library/react`, `jest-dom`, `user-event`) |
| Scripts | `pnpm --filter client test` (`vitest run`); `pnpm --filter client test:watch` |
| Include | `src/**/*.{test,spec}.{ts,tsx}` (`vite.config.ts`) |
| Strategy | Global **qa-expert** decision tree — see `client/tests/docs/TEST-STRATEGY.md` |
| Characterization | `*.characterization.spec.ts` — legacy AS-IS seams (Redux, utilities, Yup examples) |
| Component | `*.component.spec.tsx` — visible UI via role/text queries |
| Property-based | `*.property.spec.ts` — schema invariants with `fast-check` (`numRuns: 100`) |
| E2E | **Deferred** (no Playwright/Cypress; owned by e2e-agent when added) |
| Coverage | `@vitest/coverage-v8` available; **no** whole-client coverage fail gate |

Prefer explicit Vitest imports (`describe` / `it` / `expect` / `vi`) over globals. Naming: `{scenario} — {expected outcome}`.

### Development Tools

| Concern | Choice | Notes |
|---------|--------|-------|
| Dev server | `vite` | `pnpm --filter client dev` |
| Lint | ESLint flat (root) | Client rules **relaxed** for legacy |
| Types | `tsc --noEmit` / build runs `tsc && vite build` |
| Format | Prettier present | No format script in package |
| Path alias | `@/` → `client/src` | Used throughout imports |

## Project Structure

```
client/
  index.html
  vite.config.ts
  src/
    main.tsx                 Provider + PersistGate + App
    App.tsx                  ThemeProvider, BrowserRouter, lazy routes
    pages/                   Route-level screens (Auth, Home, Profile, NotFound)
    components/              Feature UI (Posts, Navbar, Friends, …)
    hooks/                   Data/orchestration hooks (usePosts, useRegister, …)
    services/                Axios API + Cognito SDK wrappers
    adapters/                API → view-model mapping (e.g. loginAdapter)
    models/                  TypeScript interfaces + empty states
    schemas/                 Yup schemas for Formik
    redux/
      store.ts               persist + configureStore (versioned migrate)
      states/authSlice.ts    Session only (`user`, `token`)
      states/postsSlice.ts   Feed (`posts`, `page`, `search`)
      states/friendsSlice.ts Friends list
      states/themeSlice.ts   Color mode
      states/userSlice.ts    LEGACY unwired
    interceptors/            Api / ApiJson axios instances
    utilities/               themeConfig, ErrorBoundary, toast configs, dates
    styled-components/       Layout primitives
    constants/               StoreKeys, etc.
    assets/                  Static assets
```

**Boundary:** pages compose components; components should not invent new Axios calls — go through `services/` (and hooks that wrap them).

## Coding Standards

### Naming Conventions

| Artifact | Convention | Example |
|----------|------------|---------|
| Components | PascalCase files/folders | `Posts/Post/Post.tsx` |
| Hooks | `use` + camelCase | `usePosts.ts` |
| Services | camelCase + `Service` or verb | `registerService`, `fetchPostComments` |
| Models | PascalCase interfaces; `*ApiModel` for wire shapes | `PostApiModel`, `UserApiModel` |
| Empty states | `*EmptyState` / `*InitialValues` | `authEmptyState`, `RegisterInitialValues` |
| Redux actions | camelCase verbs from slice | `makeLogin`, `growPostList` |
| Env vars | `VITE_*` | `VITE_APP_BASE_URL` |
| Event handlers | `handle*` or `on*` | `handleSubmit`, `onClose` |

### Component Conventions

- Functional components only (`React.FC` or typed function declarations).
- Prefer lazy-loaded pages from `App.tsx` with `<Suspense fallback={<Spinner />}>`.
- Props: explicit `interface Props` or `export interface XInterface` (legacy naming — either is fine; be consistent within a folder).
- Keep route guards in `App.tsx` via `Navigate` based on `token` / `isAuth`.
- Composition: pages layout; presentational pieces under `components/`.
- Avoid growing mega-components further; extract when a file mixes feed, modal, and form without clear sections.

### State Management

**Put in Redux when:**

- Auth session (`auth`: user, token)
- Feed posts list, page, search (`posts`)
- Friends list for the session (`friends`)
- Color mode (`theme`)

**Keep local when:**

- Modal open flags
- Uncontrolled-adjacent form field drafts inside a single component
- IntersectionObserver refs

**Do not:**

- Introduce a second global store library
- Wire `userSlice` without an explicit cleanup/migration task
- Stuff unrelated domains back into `auth`

### Service Layer Architecture

```
Component / Hook
  → services/*.ts          (Api / ApiJson / Cognito SDK)
  → adapters/*.ts          (normalize login/register payloads)
  → dispatch(matchingSlice) (auth / posts / friends / theme as needed)
```

- `Api`: default multipart `Content-Type` via interceptor (for FormData uploads).
- `ApiJson`: JSON `Content-Type`.
- Interceptors read `persist:root` from `localStorage` to attach `Bearer` token; callers may set `Authorization` explicitly (Cognito profile before persist).
- Keep response typing aligned with [`docs/api-spec.yml`](./api-spec.yml) and `models/`.
- Cognito helpers live in `services/cognito.service.ts` (or equivalent) behind `isCognitoClientEnabled()`.

## UI/UX Standards

### Design System Integration

- Wrap the tree in `ThemeProvider theme={makeTheme(mode)}` (already in `App.tsx`).
- Use MUI components (`Box`, `Typography`, `TextField`, `Avatar`, `Dialog`, …) as the default kit.
- Toggle mode through `toggleMode` in `themeSlice` (Navbar).
- Brand title in unauthenticated header: `"social media share"` (existing copy).

### Form Handling

- **Dominant stack: Formik + Yup** (`schemas/`).
- Validation schemas live under `client/src/schemas/`; initial values under `models/`.
- Register/post creation often use `FormData` and field name **`myFile`** for the file input (must match server multer).
- Show errors via Formik helpers and/or `react-toastify` (`errorToastMessageConfig` / `successToastMessageConfig`).
- **Do not introduce React Hook Form** for new forms unless the team explicitly migrates and removes Formik.

### Navigation Patterns

| Path | Screen | Guard |
|------|--------|-------|
| `/` | AuthLogin | Redirect to `/home` if authed |
| `/register` | AuthRegister | Redirect to `/home` if authed |
| `/home` | Home | Require token |
| `/profile/:id` | Profile | Require token |
| `/skeleton` | SkeletonDefault | Dev/demo |
| `/*` | NotFound | — |

- Router: `BrowserRouter` (not HashRouter).
- Deep links to profile use `:id` param matching server user `_id`.

### Accessibility

- Prefer MUI components that provide baseline roles/keyboard behavior.
- Dialogs (`CommentsModal`) should keep focus trapped via MUI Dialog defaults — do not replace with non-accessible custom modals.
- Icons used as the only label need accompanying text or `aria-label` when adding new controls.
- **No automated a11y CI** today — treat WCAG-minded changes as manual review.

## Testing Standards

### Strategy (global qa-expert)

Client tests follow **juancho global `qa-expert`** (`~/.config/opencode/skills/qa-expert`), not project-local daymade installs.

| Area | Type | Convention |
|------|------|------------|
| Redux slices, `cognitoMode`, `formatDate`, `themeConfig`, Yup companion examples | Characterization | `*.characterization.spec.ts` |
| UI (e.g. `ErrorBoundary`) | Component | `*.component.spec.tsx` |
| Schema invariants (body length, clearly-invalid email, password min) | Property-based | `*.property.spec.ts` + companion examples |
| Full journeys | E2E | Deferred |

Short strategy note: `client/tests/docs/TEST-STRATEGY.md`.

### Characterization, component, and property tests

- Follow **Arrange–Act–Assert (AAA)**; isolate each test with fresh state.
- Colocate next to the unit under test.
- Characterization: document current behavior AS-IS (including known bugs in the file header); do not “fix” production in the same change.
- Component: query priority `getByRole` → `getByLabelText` → `getByText` → `getByTestId`; assert visible behavior only (no CSS/class assertions).
- Property-based: document `// Property: …`; run with `{ numRuns: 100 }`; keep companion examples in characterization files.

### End-to-End Testing

> Status: not implemented — e2e is deferred; do not add Playwright/Cypress in drive-by changes.

### Test Organization

Backend characterization tests under `server/tests/` do **not** replace client verification. Run client tests with `pnpm --filter client test`.

## Configuration Standards

### Language/Compiler Configuration

- Vite + `tsconfig` for the client package; path alias `@/*`.
- Build: `tsc && vite build` — type errors fail the production build.

### Lint Configuration

- Root `eslint.config.js` has a dedicated `client/**/*` block with **relaxed** rules so CI stays green without a UI rewrite.
- Do not “fix” hundreds of lint issues in drive-by PRs; tighten rules only with an agreed cleanup slice.

### Environment Configuration

Copy from `client/.env.example`:

| Variable | Purpose |
|----------|---------|
| `VITE_APP_BASE_URL` | API origin (required) |
| `VITE_APP_DEFAULT_IMAGE_ID` | Default storage id (optional; aligns with server `DEFAULT_IMAGE_ID`) |
| `VITE_COGNITO_USER_POOL_ID` | Cognito pool (optional; all three Cognito vars required together) |
| `VITE_COGNITO_CLIENT_ID` | Cognito app client |
| `VITE_AWS_REGION` | Cognito region |

Vite embeds `VITE_*` at **build time**. CD injects API URL and Cognito outputs when building the SPA (see `docs/deployment.md`).

## Performance Best Practices

### Rendering Optimization

- Pages are `React.lazy` code-split.
- Infinite scroll uses `IntersectionObserver` in `Posts` + `incrementPage` — preserve this pattern when adjusting feed loading.
- Avoid storing non-serializable values in the persisted auth slice.

### Bundle Optimization

- Prefer existing lazy routes; do not eagerly import all pages in `App.tsx`.
- No formal bundle size budget documented.

### API Efficiency

- Feed loads pages of **2** posts (server hard-code) — client page counter must stay aligned.
- `searchPosts` resets page and clears posts before refetch.
- Deduplication/caching libraries (SWR) are not the standard path today.

## Development Workflow

### Development Scripts

```bash
pnpm install
cp client/.env.example client/.env   # set VITE_APP_BASE_URL
pnpm --filter client dev
pnpm --filter client lint
pnpm --filter client typecheck
pnpm --filter client build
```

API must be reachable at `VITE_APP_BASE_URL` (typically `http://localhost:3000`).

### Code Quality Gates

| Gate | Blocks merge? |
|------|---------------|
| `pnpm --filter client lint` | Yes (CI) |
| `pnpm --filter client typecheck` / build | Yes |
| Frontend tests | N/A |
| Prettier | No CI enforcement |

## Legacy and Known Debt

| Debt | Reality | Guidance |
|------|---------|----------|
| Auth mega-slice (resolved) | Split complete: `auth` session-only; `posts` / `friends` / `theme` dedicated | Keep new domains in their own slices; persist via versioned migrate |
| `userSlice` unwired | File present, unused in store | Do not import as if live |
| RHF + resolvers (removed) | Dropped from `client/package.json` | Forms stay Formik+Yup |
| SWR + dead `useCheckToken` (removed) | Hook and `swr` dependency deleted | Prefer hooks + services |
| `@ts-ignore` in places | Legacy | Remove only when typing is fixed properly |
| Nested client lockfile | Legacy | Use root `pnpm-lock.yaml` |
| `/defaultstorage` client call | Default file bootstrap | Called during register; idempotent (null on subsequent calls) |
| Hardcoded dropzone border color | Local hex | Prefer theme tokens in new UI |
