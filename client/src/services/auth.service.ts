import { urlServices } from '@/constants';
import { Api } from '@/interceptors';
import { LoginModel } from '@/models';

export const loginService = async (body: LoginModel) =>
  await Api.post(urlServices.LOGIN_URL, body);

export const registerService = async (body: FormData, options = {}) => {
  const response = await Api.post(urlServices.REGISTER_URL, body, options);
  return response;
};
