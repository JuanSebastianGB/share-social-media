import { userAdapter } from './user.adapter';

export const loginAdapter = (data: any) => ({
  token: data.token,
  user: userAdapter(data.userFound),
});
