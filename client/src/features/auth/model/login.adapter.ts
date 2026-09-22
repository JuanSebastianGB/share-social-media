import { UserApiModel } from '@/models';
import { userLoginAdapter } from '@/adapters/user.adapter';
import { AuthSessionPayload } from '../api/auth.service';

export type LoginAdapterInput = Pick<AuthSessionPayload, 'token' | 'userFound'>;

export const loginAdapter = (data: LoginAdapterInput) => ({
  token: data.token,
  user: userLoginAdapter(data.userFound as unknown as UserApiModel),
});
