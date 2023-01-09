import { AppStore } from '@/models';
import { fetchUserService } from '@/services/user.service';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

export const useUser = () => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const { token } = useSelector((store: AppStore) => store.auth);
  const fetcher = async () => await fetchUserService({ id, token });
  const response = useSWR(`users/${id}`, fetcher, {
    suspense: true,
  });

  return response;
};
