import { UserApiModel } from '@/models';
import { fetchUserService } from '@/services/user.service';
import { useEffect, useState } from 'react';

export const useUser = (id: string) => {
  const [user, setUser] = useState<UserApiModel>();
  const [error, setError] = useState({});
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const getUser = async (options: object) => {
    const response = await fetchUserService(id, options);
    setUser(response);
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      setIsError(false);
      setError({});
      setLoading(true);
      getUser({ signal });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (signal.aborted) return;
      setIsError(true);
      setError({ message: error });
      console.log({ error });
    }

    return () => controller.abort();
  }, [id]);

  return { user, error, isError, loading };
};
