import type { PostRepository } from '../ports/post-repository.js';
import type { HydratedPost, PostAssemblerDeps } from '../read/post-assembler.js';
import { assemblePost, matchesSearch } from '../read/post-assembler.js';

export async function getPost(
  repo: PostRepository,
  deps: PostAssemblerDeps,
  id: string,
): Promise<HydratedPost[]> {
  const post = await repo.findById(String(id));
  if (!post) return [];
  const hydrated = await assemblePost(post, deps);
  return hydrated ? [hydrated] : [];
}

export async function listFeedPosts(
  repo: PostRepository,
  deps: PostAssemblerDeps,
): Promise<HydratedPost[]> {
  const ids = await repo.listFeedIds();
  const posts: HydratedPost[] = [];
  for (const id of ids) {
    const post = await repo.findById(id);
    if (!post) continue;
    const hydrated = await assemblePost(post, deps);
    if (hydrated) {
      const { type: _t, fileId: _f, userId: _u, ...rest } = hydrated;
      posts.push(rest);
    }
  }
  return posts;
}

async function readPublishedPost(
  repo: PostRepository,
  deps: PostAssemblerDeps,
  id: string,
): Promise<HydratedPost | null> {
  const post = await repo.findById(id);
  if (!post) return null;
  const hydrated = await assemblePost(post, deps);
  if (!hydrated) return null;
  const { fileId: _f, userId: _u, ...rest } = hydrated;
  return rest;
}

export async function listFeedPostsPage(
  repo: PostRepository,
  deps: PostAssemblerDeps,
  start: number,
  limit: number,
  search: string,
): Promise<HydratedPost[]> {
  if (search) {
    const posts: HydratedPost[] = [];
    for (const id of await repo.listFeedIds()) {
      const published = await readPublishedPost(repo, deps, id);
      if (published && matchesSearch(published, search)) {
        posts.push(published);
      }
    }
    return posts.slice(start, start + limit);
  }

  const posts: HydratedPost[] = [];
  const needed = start + limit;
  let continuation: string | undefined;
  do {
    const page = await repo.queryFeedIds({
      limit: needed - posts.length,
      continuation,
    });
    if (page.ids.length === 0) break;
    for (const id of page.ids) {
      const published = await readPublishedPost(repo, deps, id);
      if (!published) continue;
      posts.push(published);
      if (posts.length >= needed) {
        return posts.slice(start, start + limit);
      }
    }
    continuation = page.continuation;
  } while (continuation);

  return posts.slice(start, start + limit);
}

export async function listUserPosts(
  repo: PostRepository,
  deps: PostAssemblerDeps,
  authorId: string,
): Promise<HydratedPost[]> {
  const ids = await repo.listUserPostIds(authorId);
  const posts: HydratedPost[] = [];
  for (const id of ids) {
    const post = await repo.findById(id);
    if (!post) continue;
    const hydrated = await assemblePost(post, deps);
    if (hydrated) {
      const { fileId: _f, ...rest } = hydrated;
      posts.push(rest);
    }
  }
  return posts;
}

export async function countPosts(repo: PostRepository): Promise<number> {
  return repo.count();
}
