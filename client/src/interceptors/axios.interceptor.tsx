import axios, { AxiosRequestConfig } from 'axios';

const updateHeader = (
  request: AxiosRequestConfig,
  isJsonData: boolean = false
) => {
  const persistLocalStorage = localStorage.getItem('persist:root');
  if (!persistLocalStorage) return request;
  const persist = JSON.parse(persistLocalStorage);
  const auth = JSON.parse(persist.auth);
  const token = auth.token;
  if (!!!token) return request;
  const newHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': !isJsonData ? 'multipart/form-data' : 'application/json',
  };
  request.headers = { ...request.headers, ...newHeaders };
  return request;
};

export const Api = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
});

Api.interceptors.request.use(
  (request: any) => {
    if (request.url?.includes('assets')) return request;
    return updateHeader(request);
  },
  (error) => {
    return Promise.reject(error);
  }
);
export const ApiJson = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
});

ApiJson.interceptors.request.use(
  (request: any) => {
    if (request.url?.includes('assets')) return request;
    return updateHeader(request, true);
  },
  (error) => {
    return Promise.reject(error);
  }
);
