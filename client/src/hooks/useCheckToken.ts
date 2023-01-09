import { AppStore } from '@/models';
import { checkTokenService } from '@/services';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

export const useCheckToken = () => {
  const { token } = useSelector((store: AppStore) => store.auth);
  const fetcher = async () => await checkTokenService(token);
  const { error } = useSWR('/checktoken', fetcher);

  console.log({ error });
  return {
    error: error?.response?.data === 'ERROR_NOT_VALID_SESSION_CREDENTIALS',
  };
};
