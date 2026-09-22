import { loginAdapter } from '@/adapters';
import { RegisterModel } from '@/models';
import { makeLogin } from '@/redux/states/authSlice';
import {
  createDefault,
  isCognitoClientEnabled,
  registerService,
  registerWithCognito,
} from '@/services';
import {
  createLocalPreviewSessionFromRegister,
  errorToastMessageConfig,
  isLocalPreviewEnabled,
  successToastMessageConfig,
} from '@/utilities';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const useRegister = () => {
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [displayButton, setDisplayButton] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  let controller = new AbortController();

  const onSubmit = async (values: RegisterModel, onSubmitProps: any) => {
    const { signal } = controller;

    try {
      setError(false);
      setIsLoading(true);
      setDisplayButton(false);

      if (isLocalPreviewEnabled()) {
        const session = createLocalPreviewSessionFromRegister(values);
        dispatch(makeLogin(loginAdapter(session)));
        setIsLoading(false);
        onSubmitProps.resetForm();
        toast.success('Registered successfully!', successToastMessageConfig);
        setDisplayButton(true);
        navigate('/home');
        return;
      }

      await createDefault();

      if (isCognitoClientEnabled()) {
        const session = await registerWithCognito(values, { signal });
        dispatch(makeLogin(loginAdapter(session)));
        setIsLoading(false);
        onSubmitProps.resetForm();
        toast.success('Registered successfully!', successToastMessageConfig);
        setDisplayButton(true);
        navigate('/home');
        return;
      }

      const form = new FormData();
      // @ts-ignore
      for (let value in values) form.append(value, values[value]);
      form.append('picturePath', values.myFile ? values.myFile.name : '');

      await registerService(form, { signal });
      setIsLoading(false);
      onSubmitProps.resetForm();
      toast.success('Registered successfully!', successToastMessageConfig);
      setDisplayButton(true);
      navigate('/');
    } catch (error) {
      setIsLoading(false);
      setDisplayButton(true);
      if (signal.aborted) return;
      setIsError(true);
      console.log({ error });
      setError({ error });
      toast.error('Something went wrong!', errorToastMessageConfig);
      setTimeout(() => {
        setIsError(false);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => controller.abort();
  }, []);

  return { onSubmit, error, displayButton, isLoading, isError };
};
