import type { Post } from '../../domain/post.js';

export type FileView = {
  _id: string;
  url?: string;
} | null;

export type UserView = {
  _id: string;
  firstName?: string;
  lastName?: string;
  friends?: string[];
  location?: string;
  occupation?: string;
  viewedProfile?: number;
  impressions?: number;
  profileImageId?: string;
} | null;

export type PostAssemblerDeps = {
  getFile: (fileId: string) => Promise<FileView>;
  getUser: (userId: string) => Promise<UserView>;
};

export type HydratedPost = Record<string, unknown>;

/**
 * Application read-model assembler (not domain). Matches legacy hydratePost shape.
 */
export async function assemblePost(
  post: Post,
  deps: PostAssemblerDeps,
): Promise<HydratedPost | null> {
  const snapshot = post.toSnapshot();
  const file = snapshot.fileId
    ? await deps.getFile(String(snapshot.fileId))
    : null;
  if (!file) return null;

  const user = await deps.getUser(snapshot.authorId);
  if (!user) return null;

  const profileImage = user.profileImageId
    ? await deps.getFile(String(user.profileImageId))
    : null;
  if (!profileImage) return null;

  return {
    _id: snapshot.id,
    body: snapshot.body,
    likes: snapshot.likes,
    comments: snapshot.comments,
    type: snapshot.type,
    fileId: snapshot.fileId,
    userId: snapshot.authorId,
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

export function matchesSearch(post: HydratedPost, search: string): boolean {
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
