import { UserApiModel } from '@/models';

export const userAdapter = (userApi: UserApiModel) => ({
  id: userApi._id,
  name: `${userApi.firstName} ${userApi.lastName}`,
  email: userApi.email,
  role: userApi.role,
  friends: userApi.friends,
  viewedProfile: userApi.viewedProfile,
});

export const userLoginAdapter = (userApi: UserApiModel) => ({
  id: userApi._id,
  name: `${userApi.firstName} ${userApi.lastName}`,
});
