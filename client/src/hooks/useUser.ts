import { UserApiModel } from '@/models';
import { fetchUserService } from '@/services/user.service';
import { useEffect, useState } from 'react';

export const useUser = (id: string) => {
  const [user, setUser] = useState<UserApiModel>();
  const [error, setError] = useState({});
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setIsError(false);
    setError({});
    setLoading(true);
    fetchUserService(id, { signal })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        if (signal.aborted) return;
        setIsError(true);
        setError({ error });
      });

    return () => controller.abort();
  }, [id]);

  return { user, error, isError, loading };
};
