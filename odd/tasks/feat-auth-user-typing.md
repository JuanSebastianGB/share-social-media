# feat-auth-user-typing: fix the auth.user type/runtime mismatch

## Goal

Fix a real runtime bug masked by a type lie: `auth.user` is typed as `User` (form shape: `id, name, email, password`) but the actual runtime value after login is `UserApiModel` (server shape: `_id, firstName, lastName, role[], ...`). After logout it's reset to `userEmptyState` (a `User` value) — also wrong shape.

**Concrete bug**: 5 components access `auth.user.id` to compare against `post.user._id`. After login, `auth.user` is `UserApiModel` which has `_id`, not `id`. So `auth.user.id` is `undefined` → comparison `undefined === "abc123"` is always false → `isOwn` is always false → the like button is always enabled (the UI's own-post guard doesn't work). The `@ts-ignore` masks this; the `'id' in authUser` guard I added in T8 doesn't help because runtime `UserApiModel` doesn't have `id`.

## Constraints

- **Zero behavior change for logout**: `makeLogout` still clears user + token.
- **Zero behavior change for login**: `makeLogin` still stores user + token from payload.
- **The characterization spec for authSlice must be updated** to use the correct UserApiModel shape (it's currently asserting on the buggy User shape). This is a spec that documents current wrong behavior; updating it to document the new correct behavior is the point of the fix.
- **All other tests must pass byte-for-byte**.

## Root cause

1. `models/auth.model.ts`: `Auth.user: User` — wrong shape.
2. `models/user.model.ts`: defines `User` (form shape) and `userEmptyState: User` — used by authEmptyState and makeLogout.
3. `redux/states/authSlice.ts`: `makeLogout` resets `user: userEmptyState` (User shape), `makeLogin` sets `user: action.payload.user` (UserApiModel shape at runtime).
4. Consumers: `App.tsx`, `Post.tsx`, `Modal.tsx`, `usePostComments.ts`, `usePostInteractions.ts`, `useCreatePost.ts` all destructure `{ id }` or use `auth.user.id`.

## Tasks

### T1 — Tighten user.model.ts and auth.model.ts
- Delete `User` interface (form shape) — no longer needed.
- Delete `userEmptyState` constant — replaced by emptyUserApiModel.
- Add `emptyUserApiModel: UserApiModel` constant (every field empty/zero).
- Update `Auth.user` from `User` to `UserApiModel`.
- Update `authEmptyState.user` from `userEmptyState` to `emptyUserApiModel`.

### T2 — Update store.model.ts
- Delete `AppStore.user: User` line — user slice was deleted in feat-client-typing; this is dead.

### T3 — Update authSlice.ts
- Replace `userEmptyState` import with `emptyUserApiModel`.
- `makeLogout`: `user: emptyUserApiModel` (was `user: userEmptyState`).

### T4 — Delete userSlice.ts zombie
- Remove `redux/states/userSlice.ts` (was supposed to be deleted in feat-client-typing; missed).
- Verify the index.ts export was already removed (per feat-client-typing).

### T5 — Update authSlice.characterization.spec.ts
- Change the `payload.user` from `{ id, name, email, password }` to a proper UserApiModel (use `buildLocalPreviewUserFromLogin` or define inline).
- Change `expect(next.user).toEqual(userEmptyState)` to `expect(next.user).toEqual(emptyUserApiModel)`.
- Change the `previous` state in the 2nd test similarly.

### T6 — Fix consumers
- `App.tsx:25`: `const { id }` → `const { _id: id }` (or just `auth.user._id`).
- `Post.tsx:31`: remove the `'id' in authUser` guard; use `authUser._id`.
- `Modal.tsx:40`: same.
- `usePostComments.ts:17`: change `authUser.id` → `authUser._id`, `authUser.name` → `authUser.firstName` (note: this is `name` because the form-shaped User had `name`; with UserApiModel it's firstName/lastName).
- `usePostInteractions.ts:21`: remove `'id' in authUser` guard; use `authUser._id`.
- `useCreatePost.ts:13`: same.

### T7 — Final verification
- typecheck: clean
- server tests: pass byte-for-byte (this branch doesn't touch server)
- client tests: pass (the authSlice characterization spec was updated)
- client lint: no new warnings

## Commit plan

One work-unit commit (this is a focused bug fix with cross-cutting consumer changes).

## Risk

**Low to medium**: changes the runtime shape that consumers see. Any consumer I missed would now read `_id` (which is correct) instead of `id` (which was undefined). Net behavior improvement (the bug becomes impossible), no regression possible — the existing behavior was already broken.

The authSlice characterization spec edit is intentional and correct. Per the spec header "characterization: documents current behavior, NOT intended spec" — this fix is moving from "documents current (buggy) behavior" to "documents the corrected behavior".
