import { useFriends } from '@/hooks';
import { createContext, FC, ReactNode, useContext } from 'react';

interface Props {
  children: ReactNode;
}

export const HomeContext = createContext({} as any);

export const HomeProvider: FC<Props> = ({ children }) => {
  const { data: friends, mutate: mutateFriends } = useFriends();

  const state = {
    friendsState: {
      friends,
      mutateFriends,
    },
  };

  return <HomeContext.Provider value={state}>{children}</HomeContext.Provider>;
};

export const useHomeContext = () => {
  const context = useContext(HomeContext);
  if (context === undefined) throw new Error('Not context provided');
  return context;
};
