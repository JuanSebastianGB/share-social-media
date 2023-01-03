import { urlServices } from '@/constants';
import { LoginModel } from '@/models';
import axios from 'axios';

export const loginService = async (body: LoginModel) =>
  await axios.post(
    `${import.meta.env.VITE_APP_BASE_URL}${urlServices.LOGIN_URL}`,
    body
  );

export const registerService = async (body: FormData) => {
  const response = await axios.post(
    `${import.meta.env.VITE_APP_BASE_URL}${urlServices.REGISTER_URL}`,
    body
  );
  return response;
};
