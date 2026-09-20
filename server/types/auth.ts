export interface JwtUserData {
  _id: string;
  role: string | string[];
  /** Present when the Bearer token was a Cognito access token. */
  cognitoSub?: string;
}
