import type { FormikHelpers } from 'formik';
import { AppStore } from '@/models';
import { createPost } from '@/redux/states/postsSlice';
import { makePostFileService, makePostService } from '../api';
import { successToastMessageConfig } from '@/shared/lib/utilities';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export interface PostFormValues {
  body: string;
  myFile: File | null;
}

export const useCreatePost = (
  addAction: string,
  handleClose: () => void,
) => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (
    { body, myFile }: PostFormValues,
    { resetForm }: FormikHelpers<PostFormValues>,
  ) => {
    setLoading(true);
    setSubmitError(null);
    const form = new FormData();
    form.append('body', body);
    form.append('userId', id);
    if (addAction === 'file/video' && myFile) form.append('myFile', myFile);
    try {
      let newPost;
      if (addAction === 'file/video') {
        form.append('type', 'file/video');
        newPost = await makePostFileService(form);
      }
      if (addAction === 'comment') {
        form.append('type', 'comment');
        newPost = await makePostService(form);
      }
      dispatch(createPost(newPost));
      toast.success('Post published', successToastMessageConfig);
      resetForm();
      handleClose();
    } catch {
      setSubmitError("Couldn't publish your post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, submitError, onSubmit };
};