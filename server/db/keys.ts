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

export function postSortKey(iso: string, postId: string): string {
  return `POST#${iso}#${postId}`;
}

export const SK = {
  PROFILE: 'PROFILE',
  META: 'META',
  USER: 'USER',
} as const;

export const GSI = {
  FEED: 'FEED',
} as const;
