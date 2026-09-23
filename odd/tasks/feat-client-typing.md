# feat-client-typing: tighten client types, remove zombies + @ts-ignore

## Goal

Bring the client's type safety from C (20 `@ts-ignore`, 20 `: any`, 4 dead types, 1 zombie slice) to A- by:

1. **Delete `PostModel`** — duplicate of `PostApiModel` with `id`→`_id` rename. Just use `PostApiModel` everywhere.
2. **Delete `postAdapter`** — a no-op renamer that justified its existence with a fake type delta.
3. **Type `Likes = Record<string, boolean>`** — matches the server's `Post.likes` (currently `Likes = {}`).
4. **Type `comments: string[]`** — matches the server's `Post.comments` (currently `any[]`).
5. **Delete all 20 `@ts-ignore`** in client components — they mask real type errors that the proper types will fix.
6. **Delete `userSlice`** — exported but never wired into `redux/store.ts`. `setName` and `reset` actions have zero callers.
7. **Delete zombie types/constants**: `PostFormInterface`, `userApiEmptyState`, `userModel`, `userInitialState`, `Post` (legacy userId/fileId shape).

## Constraints

- **Zero test edits**. The client has 13 `.spec.ts/.tsx` files (auth, posts, friends, theme, schemas, utils). They must all pass byte-for-byte.
- **No new dependencies**. Pure type tightening.
- **Visual / runtime behavior unchanged**. The server returns the same shape; this is purely type-side.
- **The server shape is the source of truth**. Client types must mirror the server's `toLegacyPostRecord` / `toLegacyUserRecord` shapes.
- **Cannot delete `User` interface or `userEmptyState`** — `authSlice.makeLogout` and `authSlice.characterization.spec.ts:74` depend on them.
- **Cannot delete `File` interface in `file.model.ts`** — `DropzoneAddPost.tsx` uses it (legit react-dropzone file type).

## Current state (verified)

**Dead types to delete** (zero callers outside their own definition):
- `client/src/models/post.model.ts:25 PostModel` (only used by `postAdapter`)
- `client/src/models/post.model.ts:35 PostFormInterface` (defined, never imported)
- `client/src/models/post.model.ts:4 Post` (legacy userId/fileId, never imported)
- `client/src/models/user.model.ts:38 userApiEmptyState` (defined, never imported; also has a bug: `profileImage: File` refers to the global File class)
- `client/src/models/user.model.ts:53 userModel` (defined, never imported)
- `client/src/models/user.model.ts:65 userInitialState` (defined, never imported)

**Dead functions/code to delete**:
- `client/src/features/feed/model/post.adapter.ts` (only called by `Post.tsx`)
- `client/src/redux/states/userSlice.ts` (exported, never wired into store; zero callers of actions)

**Real types to keep and possibly fix**:
- `User` (id/name/email/password) — used by `authSlice` for `userEmptyState`
- `userEmptyState` — used by `authSlice` + `authSlice.characterization.spec.ts`
- `UserApiModel` — used by 32 files
- `ProfileImage` — used by `UserApiModel`
- `File` (file.model.ts) — used by dropzone
- `PostApiModel` — used everywhere

**@ts-ignore locations** (20 total):
- Post.tsx: 8 occurrences
- Posts.tsx: 2 occurrences
- AuthRegister.tsx: 2 occurrences
- AuthLogin.tsx: 2 occurrences
- Friends.tsx: 2 occurrences
- Profile.tsx: 2 occurrences
- Home.tsx: 3 occurrences

**`: any` locations** (20 total):
- post.model.ts: 2 (comments: any[])
- Posts.tsx: 1 (useRef<any>)
- DropzoneAddPost.tsx: 2 (fileRejections + errors map)
- Modal.tsx: 1 (onSubmit: as any)
- AuthLoginForm.tsx: 5 (Formik FormikHelpers)
- useRegister.ts: 1 (onSubmitProps)
- Dropzone.tsx: 3 (Formik helpers + sx)
- ErrorBoundary.tsx: 2 (resetCondition)
- axios.interceptor.tsx: 2 (request handlers)

## Tasks

### T1 — Tighten models/post.model.ts
- Delete `Post` (legacy), `PostModel` (duplicate), `PostFormInterface` (dead).
- Type `Likes = Record<string, boolean>`.
- Type `comments: string[]`.
- Change `PostApiModel.file: File` to `PostApiModel.file: { _id: string; url: string }` (server returns `{ _id, url }`).
- Delete the broken `profileImage: File` reference in `userApiEmptyState` (whole constant).

### T2 — Delete zombies from models/user.model.ts
- Delete `userApiEmptyState` (bug + dead).
- Delete `userModel` (dead, duplicates UserApiModel).
- Delete `userInitialState` (dead).
- Keep `User`, `userEmptyState`, `UserApiModel`, `ProfileImage`.

### T3 — Delete postAdapter
- Delete `client/src/features/feed/model/post.adapter.ts` (whole file).
- Delete `client/src/features/feed/model/` directory if empty after.

### T4 — Update Post.tsx (remove all 8 @ts-ignore)
- Drop `postAdapter` import.
- Use `post` directly (already `PostApiModel`).
- Fix `checkIsLikedOwn(likes: {}, userId: string)` signature → `Record<string, boolean>`.
- Type `isOwn = id === post.user._id` (id from auth.user — needs the right type).
- Comments counter `post.comments.length` is now properly typed (string[]).

### T5 — Update Posts.tsx (remove 2 @ts-ignore + useRef<any>)
- Type `useRef<IntersectionObserver | null>(null)`.
- Spread props to `<Post />` works once PostApiModel is properly typed.

### T6 — Update usePostInteractions.ts
- Fix `state.auth.user.id` access — currently destructures `{ id }` but `User` has `id`. Verify the auth.user is actually `User` (form shape) at this point, not `UserApiModel`. If inconsistent, fix it.

### T7 — Delete userSlice zombie
- Delete `client/src/redux/states/userSlice.ts`.
- Remove the `export { default as userSlice } from './userSlice'` line in `redux/states/index.ts`.
- Verify `authSlice.characterization.spec.ts:74` still passes (uses `userEmptyState`, NOT `userSlice`).

### T8 — Other client @ts-ignore cleanup (lower priority)
This task is "nice to have" — Formik helpers and axios interceptors have legitimate `any` reasons. The 20 `@ts-ignore` count drops to 0 with T4+T5+T7 done (Post + Posts = 10). The remaining 10 (AuthRegister 2 + AuthLogin 2 + Friends 2 + Profile 2 + Home 3) are Formik/FormikHelpers patterns. Document them in a TODO comment in the feature doc — leave for a follow-up PR if scope grows.

### T9 — Final verification
- `pnpm --filter client typecheck` clean
- `pnpm --filter client lint` 0 errors (warnings acceptable — the 4 baseline warnings)
- `pnpm --filter client test` all 13 spec files pass byte-for-byte
- `git grep -n PostModel\|userApiEmptyState\|userInitialState\|userSlice\|postAdapter` returns zero matches

## Commit plan

Two work-unit commits:
1. **T1+T2+T3+T7** — model consolidation + zombies deleted (one commit, focused on type cleanup)
2. **T4+T5+T6** — Post.tsx + Posts.tsx + usePostInteractions (one commit, focused on @ts-ignore removal)

Each must verify: typecheck + lint + client tests.

## Risk: postAdapter side effects

`postAdapter` only renames `_id` to `id`. The Post component reads `adaptedPost.id` (4 occurrences). After deletion, those become `post._id` (PostApiModel uses `_id` directly). Same value, different name — no behavior change.

## Risk: User type mismatch in authSlice

`auth.user` is typed as `User` (id/name/email/password) but `makeLogin` sets it to `UserApiModel` (firstName/lastName/role[]/etc.) — these are DIFFERENT types. This is an existing type bug. Out of scope for this refactor — DO NOT FIX here (would explode the diff). Add a TODO comment in the feature doc.
