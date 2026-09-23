/**
 * Shape of the error state used by data-fetching hooks
 * (useUser, useLogin, useFriends, useUserPosts, useRegister, etc.).
 *
 * Matches the runtime shape produced by the hooks' catch blocks:
 *   setError({ error: <axios error> })
 *
 * Mirrors the server's errorMapper response (body is a STRING for known
 * routes) and the axios error structure (message + response.data).
 */
export interface HookErrorInner {
  message?: string;
  response?: {
    /** Server returns a STRING body from the central errorMapper middleware. */
    data?: string;
  };
}

export interface HookErrorState {
  error?: HookErrorInner;
}

export const isStringResponseData = (
  value: unknown,
): value is string => typeof value === 'string';

/**
 * Narrow an unknown caught value into the HookErrorState shape used by
 * data-fetching hooks. Handles null/non-object values safely.
 */
export const toHookErrorState = (err: unknown): HookErrorState => {
  if (err && typeof err === 'object') {
    return { error: err as HookErrorInner };
  }
  return { error: { message: typeof err === 'string' ? err : undefined } };
};
