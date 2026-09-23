import type { UserApiModel } from '@/models';
import { useFetchedResource } from '@/shared/hooks/useFetchedResource';
import { fetchUserService } from '../api/user.service';

export const useUser = (id: string) => {
  const { data, error, isError, isLoading } = useFetchedResource<UserApiModel>({
    fetcher: (signal) => fetchUserService(id, { signal }),
    deps: [id],
  });
  return { user: data, error, isError, loading: isLoading };
};