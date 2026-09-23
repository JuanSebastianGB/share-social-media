import type { FormikHelpers } from 'formik';
import { RegisterModel } from '@/models';
import { makeLogin } from '@/redux/states/authSlice';
import { toHookErrorState, type HookErrorState } from '@/shared/lib/types/hook-error';
import {
  errorToastMessageConfig,
  successToastMessageConfig,
} from '@/shared/lib/utilities';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginAdapter } from '../model';
import { signUp } from './authGateway';

const requestCognitoConfirmationCode = async (): Promise<string> => {
  const code = window.prompt(
    'Enter the confirmation code sent to your email:',
  );
  return code?.trim() ?? '';
};

export const useRegister = () => {
  const [error, setError] = useState<HookErrorState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [displayButton, setDisplayButton] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  let controller = new AbortController();

  const onSubmit = async (
    values: RegisterModel,
    onSubmitProps: FormikHelpers<RegisterModel>,
  ) => {
    const { signal } = controller;

    try {
      setError(null);
      setIsLoading(true);
      setDisplayButton(false);

      const result = await signUp(values, {
        signal,
        confirmSignUpCode: () => requestCognitoConfirmationCode(),
      });

      setIsLoading(false);
      onSubmitProps.resetForm();
      toast.success('Registered successfully!', successToastMessageConfig);
      setDisplayButton(true);

      if (result.kind === 'session') {
        dispatch(makeLogin(loginAdapter(result.session)));
        navigate('/home');
        return;
      }

      navigate('/');
    } catch (err) {
      setIsLoading(false);
      setDisplayButton(true);
      if (signal.aborted) return;
      setIsError(true);
      console.log({ error: err });
      setError(toHookErrorState(err));
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