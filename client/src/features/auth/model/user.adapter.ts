import { UserApiModel } from '@/models';

export const userLoginAdapter = (userApi: UserApiModel) => ({
  id: userApi._id,
  name: `${userApi.firstName} ${userApi.lastName}`,
});
