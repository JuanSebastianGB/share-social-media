import { Api } from '@/interceptors';
import {
  isLocalPreviewEnabled,
  resolvePreviewUserOrThrow,
} from '@/utilities';

export const fetchUserService = async (id: string, options = {}) => {
  if (isLocalPreviewEnabled()) {
    return resolvePreviewUserOrThrow(id);
  }

  return await Api.get(`users/${id}`, options)
    .then((data) => data.data)
    .catch((error) => {
      throw error;
    });
};
