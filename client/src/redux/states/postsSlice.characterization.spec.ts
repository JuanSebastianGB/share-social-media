import { postsEmptyState } from '@/models';
import type { PostApiModel } from '@/models';
import { describe, expect, it } from 'vitest';
import { makeLogin, makeLogout } from './authSlice';
import postsReducer, {
  createPost,
  growPostList,
  incrementPage,
  searchPosts,
  setPosts,
  togglePostLikes,
  updatePost,
} from './postsSlice';

const makePost = (overrides: Partial<PostApiModel> = {}): PostApiModel =>
  ({
    _id: 'post-1',
    body: 'hello world!',
    likes: {},
    comments: [],
    file: { _id: 'f1', url: '', deleted: false },
    user: { _id: 'u1' },
    type: 'post',
    ...overrides,
  }) as PostApiModel;

// Captured on: 2026-09-20 from feat/client-unit-tests
// Known bugs: none recorded

// characterization: documents current behavior, NOT intended spec
describe('postsSlice characterization', () => {
  it('setPosts with posts — replaces posts and resets page to 1', () => {
    // Arrange
    const previous = { ...postsEmptyState, page: 3 };
    const posts = [makePost()];

    // Act
    const next = postsReducer(previous, setPosts({ posts }));

    // Assert
    expect(next.posts).toEqual(posts);
    expect(next.page).toBe(1);
  });

  it('searchPosts with query — sets search, clears posts, resets page to 1', () => {
    // Arrange
    const previous = {
      posts: [makePost()],
      page: 4,
      search: '',
    };

    // Act
    const next = postsReducer(previous, searchPosts('cats'));

    // Assert
    expect(next.search).toBe('cats');
    expect(next.posts).toEqual([]);
    expect(next.page).toBe(1);
  });

  it("searchPosts('') — clears search string, clears posts, page 1", () => {
    // Arrange
    const previous = {
      posts: [makePost()],
      page: 3,
      search: 'cats',
    };

    // Act
    const next = postsReducer(previous, searchPosts(''));

    // Assert
    expect(next.search).toBe('');
    expect(next.posts).toEqual([]);
    expect(next.page).toBe(1);
  });

  it('createPost — prepends the new post ahead of existing', () => {
    // Arrange
    const existing = makePost({ _id: 'old' });
    const created = makePost({ _id: 'new' });
    const previous = { ...postsEmptyState, posts: [existing] };

    // Act
    const next = postsReducer(previous, createPost(created));

    // Assert
    expect(next.posts.map((p) => p._id)).toEqual(['new', 'old']);
  });

  it('updatePost matching id — replaces body of that post', () => {
    // Arrange
    const previous = {
      ...postsEmptyState,
      posts: [makePost({ _id: 'a', body: 'old body!!' })],
    };
    const updated = makePost({ _id: 'a', body: 'new body!!' });

    // Act
    const next = postsReducer(previous, updatePost(updated));

    // Assert
    expect(next.posts[0].body).toBe('new body!!');
  });

  it('growPostList — appends posts to the existing list', () => {
    // Arrange
    const previous = {
      ...postsEmptyState,
      posts: [makePost({ _id: 'a' })],
    };
    const more = [makePost({ _id: 'b' })];

    // Act
    const next = postsReducer(previous, growPostList(more));

    // Assert
    expect(next.posts.map((p) => p._id)).toEqual(['a', 'b']);
  });

  it('incrementPage — bumps page by one', () => {
    // Arrange
    const previous = { ...postsEmptyState, page: 2 };

    // Act
    const next = postsReducer(previous, incrementPage({}));

    // Assert
    expect(next.page).toBe(3);
  });

  it('togglePostLikes matching id — updates likes map on that post', () => {
    // Arrange
    const previous = {
      ...postsEmptyState,
      posts: [makePost({ _id: 'a', likes: {} })],
    };

    // Act
    const next = postsReducer(
      previous,
      togglePostLikes({ _id: 'a', likes: { u1: true } }),
    );

    // Assert
    expect(next.posts[0].likes).toEqual({ u1: true });
  });

  it('makeLogin while posts populated — resets to postsEmptyState', () => {
    // Arrange
    const previous = {
      posts: [makePost()],
      page: 5,
      search: 'q',
    };

    // Act
    const next = postsReducer(
      previous,
      makeLogin({
        user: { id: 'u1', name: 'Ada', email: 'a@b.c', password: '' },
        token: 't',
      }),
    );

    // Assert
    expect(next).toEqual(postsEmptyState);
  });

  it('makeLogout while posts populated — resets to postsEmptyState', () => {
    // Arrange
    const previous = {
      posts: [makePost()],
      page: 5,
      search: 'q',
    };

    // Act
    const next = postsReducer(previous, makeLogout({}));

    // Assert
    expect(next).toEqual(postsEmptyState);
  });
});
