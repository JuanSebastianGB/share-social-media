import { UserApiModel } from '@/models';
import { fetchUserService } from '@/services/user.service';
import { useEffect, useState } from 'react';

/**
 * It fetches the user from the API and returns the response.
 * @returns The response object is being returned.
 */
export const useUser = (id: string) => {
  const [user, setUser] = useState<UserApiModel>();

  const getUser = async () => {
    const response = await fetchUserService(id);
    setUser(response);
  };

  useEffect(() => {
    try {
      getUser();
    } catch (error) {
      console.log({ error });
    }
  }, [id]);

  return { user };
};
