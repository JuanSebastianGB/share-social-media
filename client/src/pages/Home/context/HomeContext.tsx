import { useFriends, useOwnPosts, usePosts } from '@/hooks';
import { createContext, FC, ReactNode, useContext } from 'react';

interface Props {
  children: ReactNode;
}

export const HomeContext = createContext({} as any);

export const HomeProvider: FC<Props> = ({ children }) => {
  const { data: friends, mutate: mutateFriends } = useFriends();
  const { data: posts, mutate: mutatePosts } = usePosts();
  const { data: ownPosts, mutate: mutateOwnPosts } = useOwnPosts();

  const state = {
    friendsState: {
      friends,
      mutateFriends,
    },
    postsState: {
      posts,
      mutatePosts,
    },
    ownPostsState: {
      ownPosts,
      mutateOwnPosts,
    },
  };
  console.log({ state });

  return <HomeContext.Provider value={state}>{children}</HomeContext.Provider>;
};

export const useHomeContext = () => {
  const context = useContext(HomeContext);
  if (context === undefined) throw new Error('Not context provided');
  return context;
};
