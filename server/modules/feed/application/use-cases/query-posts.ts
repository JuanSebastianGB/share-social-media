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

export async function listFeedPostsPage(
  repo: PostRepository,
  deps: PostAssemblerDeps,
  start: number,
  limit: number,
  search: string,
): Promise<HydratedPost[]> {
  const ids = await repo.listFeedIds();
  const posts: HydratedPost[] = [];
  for (const id of ids) {
    const post = await repo.findById(id);
    if (!post) continue;
    const hydrated = await assemblePost(post, deps);
    if (hydrated && matchesSearch(hydrated, search)) {
      const { fileId: _f, userId: _u, ...rest } = hydrated;
      posts.push(rest);
    }
  }
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
