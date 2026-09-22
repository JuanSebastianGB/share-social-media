import { UserApiModel } from '@/models';
import { AuthSessionPayload } from '../api/auth.service';
import { userLoginAdapter } from './user.adapter';

export type LoginAdapterInput = Pick<AuthSessionPayload, 'token' | 'userFound'>;

export const loginAdapter = (data: LoginAdapterInput) => ({
  token: data.token,
  user: userLoginAdapter(data.userFound as unknown as UserApiModel),
});
