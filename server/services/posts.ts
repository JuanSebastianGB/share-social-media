import {
  countPosts,
  createPost,
  deletePost,
  getPostById,
  listFeedPostIds,
  listUserPostIds,
  savePost,
} from '../repositories/posts.js';
import { getUserById } from '../repositories/users.js';
import { getFileService, deleteHardFileService } from './storage.js';

type HydratedPost = Record<string, unknown>;

async function hydratePost(postId: string): Promise<HydratedPost | null> {
  const post = await getPostById(postId);
  if (!post) return null;

  const file = post.fileId ? await getFileService(String(post.fileId)) : null;
  if (!file) return null;

  const user = await getUserById(post.userId);
  if (!user) return null;

  const profileImage = user.profileImageId
    ? await getFileService(String(user.profileImageId))
    : null;
  if (!profileImage) return null;

  return {
    _id: post._id,
    body: post.body,
    likes: post.likes,
    comments: post.comments,
    type: post.type,
    fileId: post.fileId,
    userId: post.userId,
    file: {
      _id: file._id,
      url: file.url,
    },
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      friends: user.friends,
      location: user.location,
      occupation: user.occupation,
      viewedProfile: user.viewedProfile,
      impressions: user.impressions,
      profileImage: {
        _id: profileImage._id,
        url: profileImage.url,
      },
    },
  };
}

function matchesSearch(post: HydratedPost, search: string): boolean {
  if (!search) return true;
  const re = new RegExp(search, 'i');
  const user = post.user as Record<string, unknown>;
  return (
    re.test(String(post.body ?? '')) ||
    re.test(String(user?.firstName ?? '')) ||
    re.test(String(user?.lastName ?? '')) ||
    re.test(String(user?.location ?? ''))
  );
}

const getPostsService = async (): Promise<any[]> => {
  const ids = await listFeedPostIds();
  const posts: HydratedPost[] = [];
  for (const id of ids) {
    const hydrated = await hydratePost(id);
    if (hydrated) {
      const { type: _t, fileId: _f, userId: _u, ...rest } = hydrated;
      posts.push(rest);
    }
  }
  return posts;
};

const getPostsPaginationService = async (
  start: number,
  limit: number,
  search: string,
): Promise<any[]> => {
  const ids = await listFeedPostIds();
  const posts: HydratedPost[] = [];
  for (const id of ids) {
    const hydrated = await hydratePost(id);
    if (hydrated && matchesSearch(hydrated, search)) {
      const { fileId: _f, userId: _u, ...rest } = hydrated;
      posts.push(rest);
    }
  }
  return posts.slice(start, start + limit);
};

const getPostService = async (id: string | unknown): Promise<any[]> => {
  const hydrated = await hydratePost(String(id));
  if (!hydrated) return [];
  return [hydrated];
};

const getUserPostsService = async (userId: string): Promise<any[]> => {
  const ids = await listUserPostIds(userId);
  const posts: HydratedPost[] = [];
  for (const id of ids) {
    const hydrated = await hydratePost(id);
    if (hydrated) {
      const { fileId: _f, ...rest } = hydrated;
      posts.push(rest);
    }
  }
  return posts;
};

const createPostService = async (body: Record<string, unknown>) =>
  await createPost(body);

const deletePostService = async (id: string) => {
  const post = await getPostService(id);
  const fileId = post[0]?.fileId;
  if (fileId) await deleteHardFileService(fileId);
  return await deletePost(id);
};

const toggleLikePostService = async (id: string, userId: string) => {
  const post = await getPostById(id);
  if (!post) return null;
  if (post.likes[userId]) {
    delete post.likes[userId];
  } else {
    post.likes[userId] = true;
  }
  return await savePost(post);
};

const countPostsService = async () => await countPosts();

export {
  getPostsService,
  getPostService,
  getPostsPaginationService,
  getUserPostsService,
  createPostService,
  deletePostService,
  toggleLikePostService,
  countPostsService,
};
