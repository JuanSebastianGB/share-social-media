import { AppStore, PostApiModel } from '@/models';
import { updatePost } from '@/redux/states/postsSlice';
import { fetchPostComments, postComment } from '@/services';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface CommentRow {
  firstName: string;
  lastName: string;
  description: string;
  createdAt: string;
  userPicturePath?: string;
}

export const usePostComments = (post: PostApiModel, open: boolean) => {
  const dispatch = useDispatch();
  const authUser = useSelector((storage: AppStore) => storage.auth.user);
  const { id } = authUser;
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [description, setDescription] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const retryLoad = () => setReloadKey((prev) => prev + 1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    const nameParts = (authUser.name || '').trim().split(/\s+/);
    const body = {
      userId: id,
      postId: post._id,
      firstName: nameParts[0] || 'User',
      lastName: nameParts.slice(1).join(' '),
      description: trimmed,
    };

    try {
      const response = await postComment(body);
      dispatch(updatePost(response));
      setDescription('');
      setReloadKey((prev) => prev + 1);
    } catch {
      setSubmitError("Couldn't post your comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingList(true);
    setListError(null);
    fetchPostComments(post._id)
      .then((data) => {
        if (!cancelled) setComments(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setListError("Couldn't load comments. Please try again.");
          setComments([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, post._id, reloadKey]);

  return {
    comments,
    description,
    setDescription,
    loadingList,
    listError,
    submitting,
    submitError,
    handleSubmit,
    retryLoad,
  };
};
