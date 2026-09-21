# Client test strategy

Authority: **juancho global `qa-expert`** (`~/.config/opencode/skills/qa-expert`), not project-local daymade installs.

Decision tree (summary):

| Seam | Test type | File convention | Skill |
|------|-----------|-----------------|-------|
| Legacy pure logic (Redux reducers, utilities, Yup schemas as currently wired) | Characterization — documents AS-IS behavior, including known bugs | `*.characterization.spec.ts` | `characterization-testing` |
| UI components (user-visible DOM) | Component — role/text queries, no CSS/implementation asserts | `*.component.spec.tsx` | `component-testing` |
| Schema / domain invariants | Property-based + companion examples in characterization files | `*.property.spec.ts` | `property-based-testing` |
| Full user journeys | E2E — **deferred** | — | `e2e-ia` / e2e-agent |

Runner: Vitest + jsdom + Testing Library (`pnpm --filter client test`). Include pattern: `src/**/*.{test,spec}.{ts,tsx}`.

Do **not** treat characterization files as intended product specs. Fix bugs in separate tasks; keep characterization green on current behavior.
