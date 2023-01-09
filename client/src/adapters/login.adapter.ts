import { userLoginAdapter } from './user.adapter';

export const loginAdapter = (data: any) => ({
  token: data.token,
  user: userLoginAdapter(data.userFound),
});
