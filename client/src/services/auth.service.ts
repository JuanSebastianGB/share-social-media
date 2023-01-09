import { urlServices } from '@/constants';
import { Api } from '@/interceptors';
import { LoginModel } from '@/models';
import axios from 'axios';

export const loginService = async (body: LoginModel) =>
  await Api.post(urlServices.LOGIN_URL, body);

export const registerService = async (body: FormData) => {
  const response = await axios.post(urlServices.REGISTER_URL, body);
  return response;
};
