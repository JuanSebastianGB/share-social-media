import type { UserApiModel } from '@/models';
import { toHookErrorState, type HookErrorState } from '@/shared/lib/types/hook-error';
import { fetchUserService } from '../api/user.service';
import { useEffect, useState } from 'react';

export const useUser = (id: string) => {
  const [user, setUser] = useState<UserApiModel | undefined>(undefined);
  const [error, setError] = useState<HookErrorState | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setIsError(false);
    setError(null);
    setLoading(true);
    fetchUserService(id, { signal })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (signal.aborted) return;
        setIsError(true);
        setError(toHookErrorState(err));
      });

    return () => controller.abort();
  }, [id]);

  return { user, error, isError, loading };
};