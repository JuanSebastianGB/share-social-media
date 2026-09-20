export const TABLE_NAME = process.env.TABLE_NAME || 'ShareSocialMedia';

export function userPk(id: string): string {
  return `USER#${id}`;
}

export function filePk(id: string): string {
  return `FILE#${id}`;
}

export function postPk(id: string): string {
  return `POST#${id}`;
}

export function commentPk(id: string): string {
  return `COMMENT#${id}`;
}

export function itemPk(id: string): string {
  return `ITEM#${id}`;
}

export function emailGsi1Pk(email: string): string {
  return `EMAIL#${email.trim().toLowerCase()}`;
}

/** Pointer item PK: maps Cognito `sub` → app user id (GetItem, no GSI). */
export function cognitoPk(sub: string): string {
  return `COGNITO#${sub}`;
}

export function postSortKey(iso: string, postId: string): string {
  return `POST#${iso}#${postId}`;
}

export const SK = {
  PROFILE: 'PROFILE',
  META: 'META',
  USER: 'USER',
  /** Cognito sub → app user link item. */
  LINK: 'LINK',
} as const;

export const GSI = {
  FEED: 'FEED',
} as const;
