import axios, { AxiosRequestConfig } from 'axios';

const updateHeader = (request: AxiosRequestConfig) => {
  const persistLocalStorage = localStorage.getItem('persist:root');
  if (!persistLocalStorage) return request;
  const persist = JSON.parse(persistLocalStorage);
  const auth = JSON.parse(persist.auth);
  const token = auth.token;
  if (!!!token) return request;
  const newHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  request.headers = { ...request.headers, ...newHeaders };
  return request;
};
export const AxiosInterceptor = () => {
  axios.interceptors.request.use((request: any) => {
    if (request.url?.includes('assets')) return request;
    return updateHeader(request);
  });
};
