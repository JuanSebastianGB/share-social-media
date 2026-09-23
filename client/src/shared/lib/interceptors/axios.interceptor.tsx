import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

const updateHeader = (
  request: AxiosRequestConfig,
  isJsonData = false,
): InternalAxiosRequestConfig => {
  const persistLocalStorage = localStorage.getItem('persist:root');
  if (!persistLocalStorage) return request as InternalAxiosRequestConfig;
  const persist = JSON.parse(persistLocalStorage);
  const auth = JSON.parse(persist.auth);
  const token = auth.token;
  if (!token) return request as InternalAxiosRequestConfig;
  // Prefer an Authorization already set by the caller (e.g. Cognito profile before Redux persists).
  const existingAuth = (request.headers as Record<string, string> | undefined)
    ?.Authorization;
  const newHeaders: Record<string, string> = {
    Authorization: existingAuth || `Bearer ${token}`,
    'Content-Type': !isJsonData ? 'multipart/form-data' : 'application/json',
  };
  request.headers = { ...request.headers, ...newHeaders };
  return request as InternalAxiosRequestConfig;
};

export const Api = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
});

Api.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    if (request.url?.includes('assets')) return request;
    return updateHeader(request);
  },
  (error) => Promise.reject(error),
);

export const ApiJson = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
});

ApiJson.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    if (request.url?.includes('assets')) return request;
    return updateHeader(request, true);
  },
  (error) => Promise.reject(error),
);